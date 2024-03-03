'use client'
import { useState } from 'react';

interface Batch {
  id: number;
  name: string;
  item_type: string;
}

interface BatchesFilterProps {
  batches: Batch[];
}

const BatchesFilter: React.FC<BatchesFilterProps> = ({ batches }) => {
  const [filter, setFilter] = useState<string>('');

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };

  const filteredBatches = filter
    ? batches.filter((batch) => batch.item_type === filter)
    : batches;

  return (
    <div>
      <select value={filter} onChange={handleFilterChange}>
        <option value="">All</option>
        <option value="Fish">Fish</option>
        <option value="Feed">Feed</option>
        {/* Add more options for other item types */}
      </select>

      <ul>
        {filteredBatches.map((batch) => (
          <li key={batch.id}>{batch.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default BatchesFilter;
