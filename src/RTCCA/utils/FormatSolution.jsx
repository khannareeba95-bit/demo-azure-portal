export const FormatSolution = ({ solution }) => {
  const numberMatch = solution?.match(/^(.*?)1\./);
  const introText = numberMatch ? numberMatch[1].trim() + '*intro*' : '';
  const pointsRegex = /(\d+)\.\s+(.*?)(?=\s+\d+\.|$)/gs;
  const matches = [...solution.matchAll(pointsRegex)];
  const serviceEngineerPointers = [introText];
  matches.forEach((match) => {
    const text = match[2].trim();
    serviceEngineerPointers.push(`${text}`);
  });

  return (
    <td className=" text-sm text-gray-900">
      {serviceEngineerPointers?.map((point, index) => {
        if (point.includes('*intro*') && point.length > 0) {
          return (
            <h1 key={`point-title-${index}`} className="font-bold text-md mb-2">
              {point.split('*intro*')[0]}
            </h1>
          );
        } else if (point.length > 0) {
          return (
            <div key={`point-${index}`} className="mb-1 flex gap-2">
              <div className=" text-gray-500 font-extrabold">{index}. </div>
              <div className="">{point}</div>
            </div>
          );
        }
      })}
    </td>
  );
};
