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
import android.util.Log

class AppBlockerService : Service() {

  private val handler = Handler(Looper.getMainLooper())
  private var blockedPackages: List<String> = emptyList()

  companion object {
    const val NOTIFICATION_ID = 7777
    const val CHANNEL_ID = "gamingtask_blocker"
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Log.d("AppBlocker", "onStartCommand SDK=${Build.VERSION.SDK_INT} packages=$blockedPackages")
    blockedPackages = intent?.getStringArrayListExtra("blockedPackages") ?: emptyList()
    Log.d("AppBlocker", "onStartCommand updated packages=$blockedPackages")
    createNotificationChannel()
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        Log.d("AppBlocker", "startForeground: using 3-arg (API34+)")
        startForeground(
          NOTIFICATION_ID,
          buildNotification(),
          android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        )
      } else {
        Log.d("AppBlocker", "startForeground: using 2-arg")
        startForeground(NOTIFICATION_ID, buildNotification())
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
    if (foreground == packageName) return
    if (foreground in blockedPackages) {
      setPendingLock()
      bringAppToFront()
    }
  }

  private fun getForegroundApp(): String? {
    val usm = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return null
    val now = System.currentTimeMillis()
    // UsageEvents.MOVE_TO_FOREGROUND で確実にフォアグラウンドアプリを検出
    val events = usm.queryEvents(now - 2000, now)
    val event = UsageEvents.Event()
    var foreground: String? = null
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
        foreground = event.packageName
      }
    }
    Log.d("AppBlocker", "foreground=$foreground blocked=$blockedPackages")
    return foreground
  }

  /**
   * SharedPreferences に show_lock フラグを立てる。
   * アプリが foreground に戻ったとき React Native 側が checkPendingLock() で読み取る。
   */
  private fun setPendingLock() {
    getSharedPreferences("gamingtask_blocker", Context.MODE_PRIVATE)
      .edit().putBoolean("show_lock", true).apply()
  }

  /** 自アプリをフォアグラウンドに持ってくる */
  private fun bringAppToFront() {
    val intent = packageManager.getLaunchIntentForPackage(packageName) ?: return
    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
      Intent.FLAG_ACTIVITY_SINGLE_TOP or
      Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
    startActivity(intent)
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID, "フォーカスモード", NotificationManager.IMPORTANCE_LOW
      ).apply { setShowBadge(false) }
      getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
  }

  private fun buildNotification(): Notification {
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

