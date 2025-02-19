import type { SearchBarProps } from '@/types/components'

const SearchBar: React.FC<SearchBarProps> = ({ searchNotes }) => {
  return (
    <input
      type="search"
      className="note-list-search"
      onChange={(e) => {
        e.preventDefault()
        searchNotes(e.target.value)
      }}
      placeholder="Search for notes"
      onDragOver={e => e.preventDefault()}
    />
  )
}

export default SearchBar
