import React from 'react';
import HeartAnimation from './HeartAnimation';
import { Analytics } from "@vercel/analytics/react"
function App() {
  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <HeartAnimation />
    </div>
  );
}

export default App;
