import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // No Firebase initialization needed here anymore
  return <Component {...pageProps} />;
}

export default MyApp;