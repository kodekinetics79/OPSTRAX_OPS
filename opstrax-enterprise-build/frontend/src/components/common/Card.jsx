const Card = ({
    children,
    className = "",
    variant = "default",
    onClick,
}) => {
    const variants = {
        default: "bg-card-dark border border-border-subtle shadow-xl hover:shadow-2xl hover:border-border-subtle/50",
        glass: "glass-card",
        primary: "bg-primary text-black-fixed shadow-lg shadow-primary/20",
        gradient: "bg-custom-gradient text-white-fixed shadow-xl",
    };

    return (
        <div
          onClick={onClick}
          className={`rounded-[20px] p-6 transition-all duration-300 overflow-hidden ${variants[variant]} ${className}`}
      >
          {children}
      </div>
  );
};

export default Card;
