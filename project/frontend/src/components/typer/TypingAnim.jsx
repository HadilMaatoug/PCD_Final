import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';

const TypingAnim = () => {
  const el = useRef(null);
  const typed = useRef(null);

  useEffect(() => {
    typed.current = new Typed(el.current, {
      strings: ['HR', 'HR Assistant',  'HR Assistant', 'HR'],
      typeSpeed: 50,
      backSpeed: 40,
      backDelay: 500,
      loop: true,
    });

    return () => {
      // Destroy Typed instance during cleanup to avoid memory leaks
      typed.current.destroy();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <span
        ref={el}
        style={{
          fontSize: '60px',
          color: 'white',
          display: 'inline-block',
          textShadow: '1px 1px 20px #000',
        }}
      />
    </div>
  );
};

export default TypingAnim;
