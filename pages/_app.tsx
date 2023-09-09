import "../styles/globals.css";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import connectToDatabase from "../mongodb";

// import "bootstrap/dist/css/bootstrap.min.css";

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session }>) {
  // useEffect(() => {
  //   // Call the connectToDatabase function when the app starts
  //   connectToDatabase();
  // }, []); 
  return (
    <>
      <Head>
        <title>MENTKNOW</title>
        <link href="/favicon.svg" rel="icon" type="image/svg" />
      </Head>
      <TooltipProvider>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
          {/* <Badge /> */}
        </SessionProvider>
      </TooltipProvider>
    </>
  );
}
