// Simple React test component
import React from 'react';

const ReactTest = () => {
  const [test, setTest] = React.useState('React is working!');
  
  React.useEffect(() => {
    console.log('React test component mounted');
  }, []);
  
  return React.createElement('div', { style: { padding: '20px', background: 'lightgreen' } }, test);
};

export default ReactTest;