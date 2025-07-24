import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = uuidv4();
  localStorage.setItem('sessionId', sessionId);
}

export const recordPageView = async (path) => {
  try {
    await axios.post('/api/pageviews', {
      sessionId,
      path,
    });
    console.log('Page view recorded:', path);
  } catch (error) {
    console.error('Error recording page view:', error);
  }
};