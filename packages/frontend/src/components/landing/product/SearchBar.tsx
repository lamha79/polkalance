import { FC, useEffect, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  FlexProps,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react'
import { useLanding } from '../../../front-provider/src'
import { mostCommonSkill, UserTypeEnum } from '../../../utility/src'
import { useColoredBadges } from '../../hooks/useColoredBadges'
import { useSearchFreelancer } from '../../hooks/useSearchFreelancer'
import { useSearchJob } from '../../hooks/useSearchJob'
import SearchJobPage from '../../../pages/searchjobs';

const SearchBar: FC<FlexProps> = ({ ...props }: FlexProps) => {
  const { type } = useLanding()
  const [title, setTitle] = useState<string>('')
  const [filters, setFilters] = useState<string[]>([])
  const [curFilters, setCurFilters] = useState<string[]>([])
  const { getCategoryColorForSkill, allSkills } = useColoredBadges()
  const [searchResults, setSearchResults] = useState<string[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const menuRef = useRef(null)
  const inputRef = useRef(null)
  const [searchText, setSearchText] = useState('')
  const searchFreelancer = useSearchFreelancer()
  const searchJobs = useSearchJob()

  const selectFilter = (filter: string) => {
    let newFilters: string[] = []
    if (!curFilters.includes(filter)) {
      newFilters = [...curFilters, filter]
      setCurFilters(newFilters)
    } else {
      newFilters = [...curFilters.filter((v) => v !== filter)]
      setCurFilters(newFilters)
    }
    if (type === UserTypeEnum.Company) {
      searchFreelancer.setSearchFilters(newFilters)
    }
    if (type === UserTypeEnum.Freelancer || type === UserTypeEnum.Guest) {
      searchJobs.setSearchFilters(newFilters) 
      searchJobs.searchJobs2(1, 8, newFilters);
    }
  }

  const handleItemClick = (filter: string | null) => {
    if (filter != 'No result') {
      console.log(`FILTERS :::: ${filter}`);
      setSearchText('')
      setSearchResults([])
      if (!filters.includes((filter ? filter : ''))) {
        setFilters([...filters, (filter ? filter : '')])
      }
      selectFilter((filter ? filter : ''))
    }
    if (isOpen) onClose()
    if (inputRef.current) (inputRef.current as HTMLElement).focus()
  }

  const searchSkills = (searchText: string) => {
    searchText = searchText.toLowerCase()
    if (searchText === '') {
      setSearchResults([])
      onClose()
      return
    }
    let searchResults = allSkills
      .filter((skill) => skill.toLowerCase().startsWith(searchText))
      .map((skill) => {
        let score = 0
        if (skill.toLowerCase() === searchText) {
          score = 100
        } else {
          score = 100 - skill.length
        }
        return {
          skill,
          score,
        }
      })

    searchResults.sort((a, b) => b.score - a.score)
    searchResults = searchResults.slice(0, 10)

    const finalResult = searchResults
      .map((result) => result.skill)
      .filter((result) => !filters.includes(result))
    if (finalResult.length > 0) {
      setSearchResults(finalResult)
    } else {
      setSearchResults(['No result'])
    }
    if (!isOpen) onOpen()
    if (inputRef.current) (inputRef.current as HTMLInputElement).focus()
  }

  useEffect(() => {
    if (type === UserTypeEnum.Freelancer || type === UserTypeEnum.Guest) {
      setTitle('Find the perfect offer')
      setCurFilters([])
      setFilters([])
    }

    if (type === UserTypeEnum.Company) {
      setTitle('Find the perfect freelancer')
      setCurFilters([])
      setFilters(mostCommonSkill)
    }
  }, [type])

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !(menuRef.current as HTMLButtonElement).contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    // Component mounted
    // Perform any setup or side effects here

    return () => {
      if (type === UserTypeEnum.Company) {
        searchFreelancer.setSearchFilters([])
        // searchFreelancer.handleSearch(1, 8, [])
      }
      if (type === UserTypeEnum.Freelancer || type === UserTypeEnum.Guest) {
        searchJobs.setSearchFilters([])
        // searchJobs.handleSearch(1, 8, []) 
      }
    }
  }, [])

  return (
    <SearchJobPage />
  )
}

export default SearchBar
