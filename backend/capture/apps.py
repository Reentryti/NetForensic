from django.apps import AppConfig
import time
import threading

class CaptureConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'capture'

    # Cleanup capture session utils function
    def ready(self):
        import os
        if os.environ.get("RUN_MAIN") != "true":
            return
        
        def delayed_cleanup():
            time.sleep(1)
            from capture.utils.cleaning_sessions import cleanup_orphan_zeek_sessions
            cleanup_orphan_zeek_sessions()

        threading.Thread(target=delayed_cleanup, daemon=True).start()