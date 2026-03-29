package expo.modules.appblocker

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper

class AppBlockerService : Service() {

  private val handler = Handler(Looper.getMainLooper())
  private var blockedPackages: List<String> = emptyList()

  companion object {
    const val NOTIFICATION_ID = 7777
    const val CHANNEL_ID = "gamingtask_blocker"
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    blockedPackages = intent?.getStringArrayListExtra("blockedPackages") ?: emptyList()
    createNotificationChannel()
    startForeground(NOTIFICATION_ID, buildNotification())
    startPolling()
    return START_STICKY
  }

  private fun startPolling() {
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
    val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, now - 5000, now)
    return stats?.maxByOrNull { it.lastTimeUsed }?.packageName
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
    intent.apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
    }
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

  override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    super.onDestroy()
  }
}
