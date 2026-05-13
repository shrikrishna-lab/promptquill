import Navbar from './Navbar';

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    marginTop: '64px',
    padding: '24px',
    maxWidth: '1200px',
    width: '100%',
    alignSelf: 'center',
  },
};

export default function Layout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Navbar />
      <main style={styles.main}>{children}</main>
    </div>
  );
}
