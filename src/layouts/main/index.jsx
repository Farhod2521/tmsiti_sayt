import React from "react";
import Wrapper from "@/components/wrapper";
import Footer from "@/components/footer";
// Sayt yordamchisi (operator bilan chat) hozircha o'chirilgan. Qayta yoqish uchun
// importni va <SiteAssistant /> ni qaytaring: import SiteAssistant from "@/components/site-assistant";

const Main = ({ children }) => {
  return (
    <Wrapper>
      <main className={"content__min_h"}>{children}</main>
      <Footer />
    </Wrapper>
  );
};

export default Main;
