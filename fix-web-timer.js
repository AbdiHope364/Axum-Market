const fs = require('fs');
const file = 'apps/web/app/admin/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldEffect = `  // Enforce 5-minute inactivity timeout
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        router.push('/admin/login');
      }, 5 * 60 * 1000); // 5 minutes
    };

    resetTimer(); // Start initially

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [router]);`;

const newEffect = `  // Enforce 5-minute inactivity timeout
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    lastActivityRef.current = Date.now();
    
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });

    const interval = setInterval(async () => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= 5 * 60 * 1000) {
        clearInterval(interval);
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        router.push('/admin/login');
      }
    }, 5000); // Check every 5 seconds instead of setting timeouts on every mouse move

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [router]);`;

if (content.includes(oldEffect)) {
    content = content.replace(oldEffect, newEffect);
    fs.writeFileSync(file, content);
    console.log("Fixed web admin timer!");
} else {
    console.log("Could not find the old effect!");
}
