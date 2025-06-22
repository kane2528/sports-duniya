import { useRecoilState } from 'recoil';
import { articlesState, filterState } from '@/recoil/atoms';

export default function Filters() {
  const [articles] = useRecoilState(articlesState);
  const [filters, setFilters] = useRecoilState(filterState);

  const uniqueAuthors = [...new Set(articles.map(a => a.author).filter(Boolean))];
  const uniqueTypes = [...new Set(articles.map(a => a.source.name).filter(Boolean))];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <select
        className="border p-2 rounded"
        value={filters.author[0] || ''}
        onChange={(e) => setFilters(prev => ({ ...prev, author: [e.target.value] }))}
      >
        <option value="">All Authors</option>
        {uniqueAuthors.map(author => <option key={author}>{author}</option>)}
      </select>

      <select
        className="border p-2 rounded"
        value={filters.type || ''}
        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
      >
        <option value="">All Types</option>
        {uniqueTypes.map(type => <option key={type}>{type}</option>)}
      </select>

      <input
        type="text"
        placeholder="Search keyword..."
        className="border p-2 rounded"
        value={filters.search}
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
      />
    </div>
  );
}