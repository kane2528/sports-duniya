import { Chart } from "react-google-charts";
import { useRecoilValue } from 'recoil';
import { articlesState } from '@/recoil/atoms';

export default function Charts() {
  const articles = useRecoilValue(articlesState);
  const authorMap = {};

  articles.forEach(a => {
    if (!a.author) return;
    authorMap[a.author] = (authorMap[a.author] || 0) + 1;
  });

  const authorData = [['Author', 'Articles'], ...Object.entries(authorMap)];

  return (
    <div className="my-6">
      <Chart
        chartType="PieChart"
        width="100%"
        height="400px"
        data={authorData}
        options={{ title: 'Articles by Author' }}
      />
    </div>
  );
}