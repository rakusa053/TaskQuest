package expo.modules.appblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {

  private val ctx get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    /** UsageStats 権限があるか */
    Function("hasUsagePermission") {
      hasUsagePermission()
    }

    /** 使用状況アクセス設定画面を開く（Android 10+ はアプリ個別ページに直接遷移） */
    Function("openUsageSettings") {
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
          data = android.net.Uri.parse("package:${ctx.packageName}")
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
      } else {
        Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
      }
      ctx.startActivity(intent)
    }

    /** インストール済みの起動可能アプリ一覧（自アプリを除く） */
    Function("getInstalledApps") {
      val pm = ctx.packageManager
      val launchIntent = Intent(Intent.ACTION_MAIN, null).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }
      pm.queryIntentActivities(launchIntent, 0)
        .filter { it.activityInfo.packageName != ctx.packageName }
        .map { mapOf("packageName" to it.activityInfo.packageName, "appName" to it.loadLabel(pm).toString()) }
        .sortedBy { it["appName"] as String }
    }

    /** ブロック対象パッケージを指定してフォアグラウンド監視サービスを開始 */
    Function("startMonitoring") { blockedPackages: List<String> ->
      val intent = Intent(ctx, AppBlockerService::class.java).apply {
        putStringArrayListExtra("blockedPackages", ArrayList(blockedPackages))
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        ctx.startForegroundService(intent)
      } else {
        ctx.startService(intent)
      }
    }

    /** 監視サービスを停止 */
    Function("stopMonitoring") {
      ctx.stopService(Intent(ctx, AppBlockerService::class.java))
    }

    /**
     * SharedPreferences に show_lock フラグが立っているか確認。
     * 立っていれば true を返してフラグをクリアする。
     * AppState active 時に React Native から呼ぶ。
     */
    Function("checkPendingLock") {
      val prefs = ctx.getSharedPreferences("gamingtask_blocker", Context.MODE_PRIVATE)
      val pending = prefs.getBoolean("show_lock", false)
      if (pending) prefs.edit().putBoolean("show_lock", false).apply()
      pending
    }
  }

  private fun hasUsagePermission(): Boolean {
    val appOps = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }
}
