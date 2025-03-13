

// eslint-disable-next-line react/prop-types
const ActionButton = ({ active, text, imgUrl, onClick, className, icon: Icon }) => {
  return (
    <div className="">
      <div className="flex justify-center gap-2 items-center">
        <button
          onClick={onClick}
          className={`w-full flex items-center justify-center gap-3 px-6 rounded-md shadow-md hover:opacity-90
            ${active
              ? "bg-gradient-to-r from-[#632366] to-[#44798E] text-white"
              : "bg-[#696F79] text-white"}
            ${className}
          `}
        >
          {text}
          {Icon && <Icon size={20} className="text-white" />}
        </button>
        
        {imgUrl && <img src={imgUrl} alt="action button" className="w-6 h-6" />}
      </div>
    </div>
  );
};

export default ActionButton;
