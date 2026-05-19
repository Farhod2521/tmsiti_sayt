import React, { useState } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";
import Title from "@/components/title";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import usePostQuery from "@/hooks/api/usePostQuery";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { get } from "lodash";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const Index = () => {
  const router = useRouter();
  const [contact, setContact] = useState({});

  const { t } = useTranslation();
  const [fileName, setFileName] = useState(t("attach_file"));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ values: contact });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("Faylni biriktirish");
    }
  };

  const { data, isLoading } = useGetTMSITIQuery({
    key: KEYS.appealCategory,
    url: URLS.appealCategory,
  });

  const { mutate: fillRequirements, isLoading: isLoadingContact } =
    usePostQuery({
      listKeyId: KEYS.appeal,
    });

  const onSubmit = ({
    full_name,
    email,
    phone,
    text,
    file,
    appeal_category,
  }) => {
    let formContact = new FormData();
    formContact.append("full_name", full_name);
    formContact.append("email", email);
    formContact.append("phone", phone);
    formContact.append("text", text);
    formContact.append("file", file[0]);
    formContact.append("appeal_category", appeal_category);
    fillRequirements(
      {
        url: URLS.appeal,
        attributes: formContact,
      },
      {
        onSuccess: () => {
          toast.success(
            t("toast_success_message"),
            {
              position: "top-right",
            },
            router.push("/")
          );
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };
  return (
    <Main>
      <Menu />
      <section className={"bg-[#EFF3FA] text-xs text-[#607198] mb-[50px]"}>
        <div
          className={
            "container py-[12px] px-[20px] md:px-[15px] lg:px-[10px] xl:px-0"
          }
        >
          <Link href={"/"}>{t("homepage")} / </Link>
          <Link href={"#"} className={"capitalize"}>
            {t("contact")}{" "}
          </Link>
        </div>
      </section>
      <section
        className={
          "container mb-[70px] px-[20px] md:px-[15px] lg:px-[10px] xl:px-0"
        }
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className={"capitalize"}
        >
          <Title>{t("contact")}</Title>
        </motion.div>
        <div
          className={
            "bg-[#F7F9FC] px-[50px] py-[30px] flex lg:flex-row flex-col gap-x-[50px]"
          }
        >
          <div className={" md:w-[605px] md:h-[404px] w-auto h-auto"}>
            <motion.div
              initial={{ translateY: "-100px" }}
              animate={{ translateY: 0 }}
              transition={{ duration: 0.4 }}
              className={
                "bg-white xl:w-full w-auto h-[404px] col-span-6 shadow-[0_1px_5px_0_rgba(40,54,109,0.15)]"
              }
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14753.290627247186!2d69.49037165!3d41.298116449999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae570029e25e3f%3A0x9ac3b4503f3d11ad!2sMinisterstvo%20Stroitel&#39;stva%20I%20Kommunal&#39;nogo%20Khozyaystva%20Respubliki%20Uzbekistan!5e1!3m2!1sen!2s!4v1771583562359!5m2!1sen!2s"
                allowFullScreen=""
                width={605}
                height={404}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
            <ul
              className={"text-[#001A57] mt-[30px] flex flex-col gap-y-[12px]"}
            >
              <motion.li
                initial={{ translateY: "100px" }}
                animate={{ translateY: 0 }}
                transition={{ duration: 0.5 }}
                className={"flex gap-x-[10px] items-center"}
              >
                <Image
                  src={"/icons/location_icon.svg"}
                  width={24}
                  height={24}
                  alt="location"
                />
                <p className={"lg:text-base md:text-sm text-xs"}>
                  {t("address")}
                </p>
              </motion.li>
              <motion.li
                initial={{ translateY: "80px" }}
                animate={{ translateY: 0 }}
                transition={{ duration: 0.7 }}
                className={"flex gap-x-[10px] items-center"}
              >
                <Image
                  src={"/icons/exat.svg"}
                  alt="exat"
                  width={24}
                  height={24}
                />
                <p className={"lg:text-base md:text-sm text-xs"}>
                  <Link href={"mailto: info@tmsiti.uz"}>info@tmsiti.uz</Link>
                </p>
              </motion.li>
              <motion.li
                className={"flex gap-x-[10px] items-center"}
                initial={{ translateY: "60px" }}
                animate={{ translateY: 0 }}
                transition={{ duration: 0.9 }}
              >
                <Image
                  src={"/icons/exat.svg"}
                  alt="exat"
                  width={24}
                  height={24}
                />
                <p className={"lg:text-base md:text-sm text-xs"}>
                  <Link href={"mailto: TMSITI@exat.uz"}>TMSITI@exat.uz</Link>
                </p>
              </motion.li>
              <motion.li
                className={"flex gap-x-[10px]"}
                initial={{ translateY: "40px" }}
                animate={{ translateY: 0 }}
                transition={{ duration: 1.1 }}
              >
                <Image
                  src={"/icons/call.svg"}
                  alt="call"
                  width={24}
                  height={24}
                />
                <Link
                  className={"lg:text-base md:text-sm text-xs"}
                  href={"tel:+998 71 244-51-84"}
                >
                  +998 55 900-00-59
                </Link>
              </motion.li>
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, translateY: "-50px" }}
            animate={{ opacity: 1, translateY: "0px" }}
            transition={{ duration: 1 }}
            className={"col-span-1 w-[2px] bg-[#2E6DFF]"}
          ></motion.div>

          <div className={"col-span-5 lg:w-[605px]"}>
            <form
              className={"flex flex-col gap-y-[20px]"}
              onSubmit={handleSubmit(onSubmit)}
            >
              {/*FIO*/}
              <motion.div
                className={"label-float"}
                initial={{ opacity: 0, translateX: "120px" }}
                animate={{ opacity: 1, translateX: "0px" }}
                transition={{ duration: 0.9 }}
              >
                <input
                  type={"text"}
                  placeholder={""}
                  {...register("full_name", { required: true })}
                  className={
                    "w-full !focus:outline-none !focus:bg-white py-[13px] px-[30px] shadow-[0_4px_4px_0_rgba(40,54,109,0.15)] cursor-pointer focus:outline-none rounded-[5px] placeholder:text-[#535E8A]"
                  }
                />
                <label className={"text-[#535E8A]"}>{t("fullname")}</label>
              </motion.div>

              {/*Email*/}
              <motion.div
                className={"label-float"}
                initial={{ opacity: 0, translateX: "120px" }}
                animate={{ opacity: 1, translateX: "0px" }}
                transition={{ duration: 1.2 }}
              >
                <input
                  type={"email"}
                  placeholder={"E-mail"}
                  {...register("email", { required: true })}
                  className={
                    " w-full py-[13px] px-[30px] text-[15px] shadow-[0_4px_4px_0_rgba(40,54,109,0.15)] cursor-pointer focus:outline-none rounded-[5px] placeholder:text-[#535E8A]"
                  }
                />
                <label>{t("email")}</label>
              </motion.div>

              {/*Telefon nomer*/}
              <motion.div
                className={"label-float"}
                initial={{ opacity: 0, translateX: "120px" }}
                animate={{ opacity: 1, translateX: "0px" }}
                transition={{ duration: 1.5 }}
              >
                <input
                  type={"tel"}
                  placeholder={""}
                  {...register("phone", { required: true })}
                  className={
                    "w-full py-[13px] px-[30px] shadow-[0_4px_4px_0_rgba(40,54,109,0.15)] rounded-[5px] cursor-pointer focus:outline-none placeholder:text-[#535E8A]"
                  }
                />
                <label>{t("phone")}</label>
              </motion.div>

              {/*Murojaat turi*/}
              {/*<div className={"label-float"}>*/}
              {/*  <input*/}
              {/*    list={"search-list"}*/}
              {/*    placeholder={"Murojaat turi"}*/}
              {/*    className={*/}
              {/*      "placeholder:text-[#535E8A] py-[15px] px-[30px] border-gray-200 focus:border-gray-500  focus:outline-none w-full shadow-xl rounded-[5px] relative"*/}
              {/*    }*/}
              {/*    {...register("appeal_category")}*/}
              {/*  />*/}
              {/*  <label>Murojaat turi</label>*/}
              {/*  <datalist*/}
              {/*    id={"search-list"}*/}
              {/*    className={"w-[1000px]"}*/}
              {/*    onChange={(e) => setPageSize(e?.target?.value)}*/}
              {/*  >*/}
              {/*    {get(data, "data", []).map((item) => (*/}
              {/*      <option*/}
              {/*        key={get(item, "id")}*/}
              {/*        value={get(item, "id")}*/}
              {/*        {...register("appeal_category")}*/}
              {/*      >*/}
              {/*        {get(item, "name")}*/}
              {/*      </option>*/}
              {/*    ))}*/}
              {/*  </datalist>*/}
              {/*</div>*/}

              <motion.div
                className={"label-float"}
                initial={{ opacity: 0, translateX: "120px" }}
                animate={{ opacity: 1, translateX: "0px" }}
                transition={{ duration: 1.8 }}
              >
                <select
                  className={
                    "w-full py-[13px] px-[30px] shadow-[0_4px_4px_0_rgba(40,54,109,0.15)] rounded-[5px] cursor-pointer focus:outline-none"
                  }
                  {...register("appeal_category")}
                  placeholder={"Murojaat turi"}
                >
                  {get(data, "data", []).map((item) => (
                    <option
                      key={get(item, "id")}
                      value={get(item, "id")}
                      label={get(item, "name")}
                    ></option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                className={"label-float"}
                initial={{ opacity: 0, translateX: "120px" }}
                animate={{ opacity: 1, translateX: "0px" }}
                transition={{ duration: 2.1 }}
              >
                <textarea
                  placeholder={t("request_text")}
                  {...register("text", { required: true })}
                  className={
                    "w-full h-[192px] py-[13px] px-[30px] shadow-[0_4px_4px_0_rgba(40,54,109,0.15)] rounded-[5px] placeholder:text-[#535E8A]"
                  }
                ></textarea>
              </motion.div>

              {/*<div className="text-sm cursor-pointer text-[#1A4DC2] ml-[30px]  flex">*/}
              {/*  <label htmlFor="inputGroupFile">Fayl biriktirish</label>*/}
              {/*  <input type="file" {...register("file")} className={"hidden"} />*/}
              {/*</div>*/}

              <motion.div
                className=" flex  "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <label htmlFor="fileInput" className="text-[#535E8A]">
                  <span className={"text-[#1A4DC2]"}>{fileName}</span>
                  <input
                    id="fileInput"
                    type="file"
                    className={"opacity-0"}
                    {...register("file")}
                    onChange={handleFileChange}
                  />
                </label>
              </motion.div>

              <motion.button
                initial={{
                  opacity: 0,
                  translateY: "20px",
                  transLateZ: "20px",
                }}
                animate={{ opacity: 1, translateY: "0px", translateZ: "0px" }}
                transition={{ duration: 0.2 }}
                className={
                  "py-[13px] px-[33px] bg-[#1A4DC2] md:w-[230px] lg:text-base md:text-sm text-sm text-[#fff] mx-auto hover:bg-[#1E56D8] transition-all duration-300"
                }
              >
                {t("send_request")}
              </motion.button>
            </form>
          </div>
        </div>
      </section>
    </Main>
  );
};

export default Index;
