import React from "react";
import Wrapper from "@/components/wrapper";
import Footer from "@/components/footer";
import SiteAssistant from "@/components/site-assistant";

const Main = ({ children }) => {
  return (
    <Wrapper>
      <main className={"content__min_h"}>{children}</main>
      <Footer />
      <SiteAssistant />
    </Wrapper>
  );
};

export default Main;
