const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldEffect = `  useEffect(() => {
    if (!sessionUser) return;

    if (sessionSecondsLeft !== null && sessionSecondsLeft <= 0) {
      handleSessionTimeout();
      return;
    }

    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev === null) return 300;
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Reset timer on user activity
    const resetTimer = () => setSessionSecondsLeft(300);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [sessionUser, handleSessionTimeout]);`;

const newEffect = `  // Use a ref to track activity without triggering React re-renders on every mouse move
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!sessionUser) return;

    // Reset activity tracker on mount
    lastActivityRef.current = Date.now();
    setSessionSecondsLeft(300);

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Throttle event listeners (don't update state, just update the ref)
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // One single interval to update the visual countdown and handle logout
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      
      setSessionSecondsLeft(remaining);

      if (remaining <= 0) {
        handleSessionTimeout();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [sessionUser, handleSessionTimeout]);`;

if (content.includes(oldEffect)) {
    content = content.replace(oldEffect, newEffect);
    fs.writeFileSync(file, content);
    console.log("Fixed apps/admin/app/page.tsx timer!");
} else {
    console.log("Could not find the old effect!");
}
