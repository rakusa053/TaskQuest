package expo.modules.appblocker

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.util.Log

class AppBlockerService : Service() {

  private val handler = Handler(Looper.getMainLooper())
  private var blockedPackages: List<String> = emptyList()
  private var lastBlockedPackage: String? = null

  companion object {
    const val NOTIFICATION_ID = 7777
    const val ALERT_NOTIFICATION_ID = 7778
    const val CHANNEL_ID = "taskqest_blocker"
    const val ALERT_CHANNEL_ID = "taskqest_blocker_alert"
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Log.d("AppBlocker", "onStartCommand SDK=${Build.VERSION.SDK_INT} packages=$blockedPackages")
    blockedPackages = intent?.getStringArrayListExtra("blockedPackages") ?: emptyList()
    Log.d("AppBlocker", "onStartCommand updated packages=$blockedPackages")
    createNotificationChannels()
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        startForeground(
          NOTIFICATION_ID,
          buildForegroundNotification(),
          android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        )
      } else {
        startForeground(NOTIFICATION_ID, buildForegroundNotification())
      }
      Log.d("AppBlocker", "startForeground success")
    } catch (e: Exception) {
      Log.e("AppBlocker", "startForeground FAILED: ${e::class.simpleName}: ${e.message}", e)
    }
    startPolling()
    return START_STICKY
  }

  override fun onDestroy() {
    Log.d("AppBlocker", "onDestroy called")
    handler.removeCallbacksAndMessages(null)
    super.onDestroy()
  }

  private fun startPolling() {
    handler.removeCallbacksAndMessages(null)
    handler.post(object : Runnable {
      override fun run() {
        checkForeground()
        handler.postDelayed(this, 500)
      }
    })
  }

  private fun checkForeground() {
    val foreground = getForegroundApp() ?: return
    // 自アプリは除外
    if (foreground == packageName) {
      lastBlockedPackage = null
      return
    }
    if (foreground in blockedPackages) {
      // 解放タイマーが有効な間はブロックしない
      val prefs = getSharedPreferences("taskqest_blocker", Context.MODE_PRIVATE)
      val unlockExpiresAt = prefs.getLong("unlock_expires_at", 0L)
      if (System.currentTimeMillis() < unlockExpiresAt) {
        Log.d("AppBlocker", "Unlock active until $unlockExpiresAt, skipping block")
        lastBlockedPackage = null  // 解放中はリセット → 期限切れ直後に即ブロック再発動
        return
      }
      // 同じアプリを連続で検出した場合は通知を重複して出さない
      if (foreground == lastBlockedPackage) return
      lastBlockedPackage = foreground
      Log.d("AppBlocker", "Blocking $foreground -> showing alert notification")
      setPendingLock()
      showBlockAlert()
    } else {
      lastBlockedPackage = null
    }
  }

  private fun getForegroundApp(): String? {
    val usm = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return null
    val now = System.currentTimeMillis()
    // 直近10分のイベントを見て最後にフォアグラウンドに来たアプリを返す。
    // 2秒ウィンドウだとアプリを開いたまま2秒以上経つと検出できなくなるため。
    val events = usm.queryEvents(now - 10 * 60_000L, now)
    val event = UsageEvents.Event()
    var foreground: String? = null
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
        foreground = event.packageName
      }
    }
    return foreground
  }

  /**
   * ロックフラグを立て、JS側に直接イベントを送る。
   * startActivity の前に呼ぶことで、アプリが前面に来た時点でロック画面が表示される。
   */
  private fun setPendingLock() {
    // SharedPreferences（フォールバック用）
    getSharedPreferences("taskqest_blocker", Context.MODE_PRIVATE)
      .edit().putBoolean("show_lock", true).apply()
    // Expo イベントで JS に直接通知（より確実）
    AppBlockerModule.emitBlockDetected?.invoke()
    Log.d("AppBlocker", "setPendingLock: event emitted, emitBlockDetected=${AppBlockerModule.emitBlockDetected != null}")
  }

  /**
   * ブロックアプリ検出時の対応。
   * - SYSTEM_ALERT_WINDOW 権限あり → 直接 Activity 起動（Android 10+ でも可）
   * - 権限なし → 高優先度通知でユーザーを誘導
   */
  private fun showBlockAlert() {
    if (Settings.canDrawOverlays(this)) {
      val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
      }
      if (intent != null) {
        Log.d("AppBlocker", "canDrawOverlays=true, launching activity directly")
        startActivity(intent)
        return
      }
    }
    Log.d("AppBlocker", "canDrawOverlays=false, showing notification")
    showNotificationAlert()
  }

  private fun showNotificationAlert() {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
    } ?: return

    val pi = PendingIntent.getActivity(
      this, ALERT_NOTIFICATION_ID, launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, ALERT_CHANNEL_ID)
        .setContentTitle("🔒 フォーカスモード")
        .setContentText("このアプリはブロックされています。タップして戻る")
        .setSmallIcon(android.R.drawable.ic_lock_lock)
        .setContentIntent(pi)
        .setAutoCancel(true)
        .setOnlyAlertOnce(false)
        .build()
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
        .setContentTitle("🔒 フォーカスモード")
        .setContentText("このアプリはブロックされています。タップして戻る")
        .setSmallIcon(android.R.drawable.ic_lock_lock)
        .setContentIntent(pi)
        .setAutoCancel(true)
        .build()
    }
    nm.notify(ALERT_NOTIFICATION_ID, notification)
  }

  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val nm = getSystemService(NotificationManager::class.java)
      // 常駐通知（低優先度）
      nm.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, "フォーカスモード", NotificationManager.IMPORTANCE_LOW)
          .apply { setShowBadge(false) }
      )
      // ブロック通知（高優先度）
      nm.createNotificationChannel(
        NotificationChannel(ALERT_CHANNEL_ID, "ブロック通知", NotificationManager.IMPORTANCE_HIGH)
          .apply { setShowBadge(true) }
      )
    }
  }

  private fun buildForegroundNotification(): Notification {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pi = PendingIntent.getActivity(
      this, 0, launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
        .setContentTitle("🔒 フォーカスモード中")
        .setContentText("タスクに集中しましょう")
        .setSmallIcon(android.R.drawable.ic_lock_lock)
        .setContentIntent(pi)
        .setOngoing(true)
        .build()
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
        .setContentTitle("🔒 フォーカスモード中")
        .setContentText("タスクに集中しましょう")
        .setSmallIcon(android.R.drawable.ic_lock_lock)
        .setContentIntent(pi)
        .setOngoing(true)
        .build()
    }
  }

}
