interface SMSBubbleProps {
  from: 'business' | 'customer';
  children: React.ReactNode;
  time?: string;
}

const SMSBubble = ({ from, children, time }: SMSBubbleProps) => {
  const isBusiness = from === 'business';
  return (
    <div className={`flex ${isBusiness ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
          isBusiness
            ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-bl-sm'
            : 'bg-blue-500 text-white rounded-br-sm'
        }`}
      >
        {children}
        {time && (
          <p
            className={`text-[10px] mt-1 ${
              isBusiness ? 'text-gray-400' : 'text-blue-200'
            }`}
          >
            {time}
          </p>
        )}
      </div>
    </div>
  );
};

export default SMSBubble;
