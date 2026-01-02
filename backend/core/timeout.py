import sys
import threading
from contextlib import contextmanager

class TimeoutError(Exception):
    pass

@contextmanager
def time_limit(seconds):
    if sys.platform != "win32":
        # Unix-safe SIGALRM
        import signal

        def signal_handler(signum, frame):
            raise TimeoutError("Operation timed out")

        old_handler = signal.signal(signal.SIGALRM, signal_handler)
        signal.alarm(seconds)
        try:
            yield
        finally:
            signal.alarm(0)
            signal.signal(signal.SIGALRM, old_handler)

    else:
        # Windows-safe timer
        timer = threading.Timer(
            seconds,
            lambda: (_ for _ in ()).throw(TimeoutError("Operation timed out"))
        )
        timer.start()
        try:
            yield
        finally:
            timer.cancel()
