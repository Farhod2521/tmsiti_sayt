import React from "react";
import Wrapper from "@/components/wrapper";
import Footer from "@/components/footer";

const Main = ({ children }) => {
  return (
    <Wrapper>
      <main className={"content__min_h"}>{children}</main>
      <Footer />
    </Wrapper>
  );
};

export default Main;
