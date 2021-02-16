import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

function AppComponent({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentUser");

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  // console.log("AppComponent, pageProps:", pageProps);

  return { pageProps, ...data };
};

export default AppComponent;
