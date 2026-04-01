import { useState } from "react";
import { ChevronBackward } from "./ChevronBackward";
import { Lock } from "./Lock";
import { Mail } from "./Mail";
import { Person } from "./Person";
import group29 from "./group-29.png";

export const SignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white w-full min-w-[402px] min-h-[874px] relative">
      <div className="absolute top-0 left-0 w-[402px] h-[874px] bg-[linear-gradient(180deg,rgba(226,232,119,1)_0%,rgba(127,183,100,1)_100%)]" />

      <div className="absolute top-[58px] left-[18px] w-[365px] h-[364px] bg-white rounded-[182.5px/182px]" />

      <form
        onSubmit={handleSubmit}
        className="absolute top-0 left-0 w-[402px] h-[874px]"
        aria-label="Sign up form"
      >
        {/* Username Field */}
        <div className="absolute top-[450px] left-7 w-[348px] h-[61px]">
          <div className="absolute top-[-3px] left-[-3px] w-[352px] h-[67px] bg-white rounded-[25px] border-[3px] border-solid border-[#cccccc]" />
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
            autoComplete="username"
            className="absolute top-0 left-0 w-full h-full bg-transparent rounded-[25px] pl-[54px] pr-4 [font-family:'Work_Sans-Regular',Helvetica] font-normal text-[#616161] text-xl tracking-[-0.40px] leading-[normal] whitespace-nowrap focus:outline-none focus:border-[#7fb764] border-[3px] border-transparent"
          />
        </div>

        {/* Email Field */}
        <div className="absolute top-[540px] left-7 w-[348px] h-[61px]">
          <div className="absolute top-[-3px] left-[-3px] w-[352px] h-[67px] bg-white rounded-[25px] border-[3px] border-solid border-[#cccccc]" />
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            autoComplete="email"
            className="absolute top-0 left-0 w-full h-full bg-transparent rounded-[25px] pl-[56px] pr-4 [font-family:'Work_Sans-Regular',Helvetica] font-normal text-[#616161] text-xl tracking-[-0.40px] leading-[normal] whitespace-nowrap focus:outline-none focus:border-[#7fb764] border-[3px] border-transparent"
          />
        </div>

        {/* Password Field */}
        <div className="absolute top-[630px] left-7 w-[348px] h-[61px]">
          <div className="absolute top-[-3px] left-[-3px] w-[352px] h-[67px] bg-white rounded-[25px] border-[3px] border-solid border-[#cccccc]" />
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            autoComplete="new-password"
            className="absolute top-0 left-0 w-full h-full bg-transparent rounded-[25px] pl-[54px] pr-4 [font-family:'Work_Sans-Regular',Helvetica] font-normal text-[#616161] text-xl tracking-[-0.40px] leading-[normal] whitespace-nowrap focus:outline-none focus:border-[#7fb764] border-[3px] border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="absolute top-[741px] left-7 w-[348px] h-[72px]">
          <button
            type="submit"
            className="absolute top-0 left-0 w-[346px] h-[72px] bg-[#355027] rounded-[25px] flex items-center justify-start cursor-pointer hover:bg-[#2a4020] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#355027]"
            aria-label="Create Account"
          >
            <span className="absolute top-[22px] left-11 w-[286px] h-[27px] flex items-center [font-family:'Alexandria-Regular',Helvetica] font-normal text-white text-[34px] tracking-[-0.68px] leading-[normal] whitespace-nowrap">
              Create Account
            </span>
          </button>
        </div>
      </form>

      <ChevronBackward className="!absolute !top-[76px] !left-7 !w-10 !h-10 !aspect-[1]" />
      <Person className="!absolute !top-[460px] !left-[38px] !w-10 !h-10" />
      <Lock className="!absolute !top-[644px] !left-[41px] !w-[34px] !h-[34px]" />
      <Mail className="!absolute !top-[555px] !left-10 !w-[33px] !h-[33px]" />
      <img
        className="absolute top-[86px] left-[45px] w-[285px] h-[321px]"
        alt="Group"
        src={group29}
      />
    </div>
  );
};
