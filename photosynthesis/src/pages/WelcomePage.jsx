import leaves31 from "./leaves-3-1.png";

export const WelcomeScreen = () => {
  return (
    <div className="bg-white overflow-hidden w-full min-w-[402px] min-h-[874px] relative">
      <div className="absolute top-0 left-[-43px] w-[505px] h-[952px]">
        <div className="left-[43px] w-[402px] h-[874px] bg-[linear-gradient(180deg,rgba(255,255,255,1)_36%,rgba(226,232,119,1)_100%)] absolute top-0" />

        <img
          className="absolute top-[260px] left-[43px] w-[402px] h-[614px] aspect-[0.73] object-cover"
          alt="Leaves"
          src={leaves31}
        />

        <div className="left-[43px] w-[402px] h-[874px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_56%,rgba(226,232,119,1)_100%)] absolute top-0" />
      </div>

      <p className="absolute top-[91px] left-[106px] [font-family:'Alexandria-Medium',Helvetica] font-normal text-black text-[40px] text-center tracking-[0] leading-10">
        <span className="font-[number:var(--title-font-weight)] font-title [font-style:var(--title-font-style)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] text-[length:var(--title-font-size)]">
          Welcome
          <br />
        </span>

        <span className="[font-family:'Karla-Regular',Helvetica] text-[32px] leading-[30px]">
          to
        </span>
      </p>

      <div className="absolute top-40 left-9 [font-family:'Alexandria-Bold',Helvetica] font-bold text-[#1f5e00] text-[44px] text-center tracking-[0] leading-[normal]">
        Photosynthesis
      </div>

      <div className="absolute top-[682px] left-12 w-[308px] h-[71px]">
        <button
          type="button"
          className="left-0 w-[306px] h-[71px] bg-[#355027] rounded-[50px] shadow-[0px_4px_4px_#00000040] absolute top-0 cursor-pointer border-0 p-0"
          aria-label="Get Started"
        />

        <div className="absolute top-[11px] left-12 w-[210px] h-[50px] flex items-center justify-center [font-family:'Alexandria-Regular',Helvetica] font-normal text-[#f7f8d9] text-4xl text-center tracking-[0] leading-[normal] pointer-events-none">
          Get Started
        </div>
      </div>

      <p className="absolute top-[802px] left-[9px] w-[383px] h-[38px] flex items-center justify-center [font-family:'Alexandria-Regular',Helvetica] font-normal text-black text-xl text-center tracking-[0] leading-[normal]">
        Already have an account? Sign In
      </p>
    </div>
  );
};
