'use client'

import { useState, useEffect } from 'react'
import { SquarePlus, Save } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  RowData
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Input } from '@/components/ui/input'
import { User } from '@/app/users/data'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
    addRow: () => void
    removeRow: (rowIndex: number) => void
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: User[]
}

export function DataTable<TData, TValue>({
  columns,
  data: defaultData
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState(() => [...defaultData])
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    if (isRemoved) {
      localStorage.setItem('users', JSON.stringify(data))
      toast.success('Data has been removed!')
      setIsRemoved(false)
    }
  }, [isRemoved === true])

  const defaultColumn: Partial<ColumnDef<any>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue()
      const [value, setValue] = useState(initialValue)

      // When the input is blurred, we'll call our table meta's updateData function
      const onBlur = () => {
        table.options.meta?.updateData(index, id, value)
      }
      // If the initialValue is changed external, sync it up with our state
      useEffect(() => {
        setValue(initialValue)
      }, [initialValue])

      const [isError, setIsError] = useState(false)
      const [errorMessage, setErrorMessage] = useState('')

      const validateEmail = (email: any): boolean => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(email)
      }

      const checkDuplicateEmail = (email: any): boolean => {
        // Check if email already exists in data array
        return data.some(person => person.email === email)
      }

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (id !== 'email') {
          setValue(e.target.value)

          return
        }

        setValue(e.target.value)
        if (!validateEmail(e.target.value)) {
          setErrorMessage('Invalid email format')
          setIsError(true)
        } else if (checkDuplicateEmail(e.target.value)) {
          setErrorMessage('Email already exists')
          setIsError(true)
        } else {
          setErrorMessage('')
          setIsError(false)
        }
      }

      return (
        <>
          <input
            value={value as string}
            onChange={onChange}
            onBlur={onBlur}
            className='w-full max-w-sm pl-3'
          />
          {isError && (
            <p
              id='error_message'
              className='mt-2 text-xs text-red-600 dark:text-red-400'
            >
              {errorMessage}
            </p>
          )}
        </>
      )
    }
  }

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    state: {
      sorting,
      columnFilters
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value
              }
            }
            return row
          })
        )
      },
      addRow: () => {
        const newRow: any = {
          firstName: '',
          lastName: '',
          position: '',
          phone: '',
          email: '',
          id: `${Math.floor(Math.random() * 10000)}`
        }
        toast.success('Success adding new row!')
        const setFunc = (old: any[]) => [...old, newRow]
        setData(setFunc)
      },
      removeRow: (rowIndex: number) => {
        const setFilterFunc = (old: User[]) =>
          old.filter((_row: User, index: number) => index !== rowIndex)
        const setFilter = (old: User[]) => {
          return old.filter((_row: User, index: number) => index !== rowIndex)
        }
        setData(setFilterFunc)
        setIsRemoved(true)
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const onSave = () => {
    localStorage.setItem('users', JSON.stringify(data))
    toast.success('Data updated!')
  }

  return (
    <>
      {/* Filters */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center py-4'>
          <Input
            placeholder='Search by name...'
            value={
              (table.getColumn('firstName')?.getFilterValue() as string) ?? ''
            }
            onChange={event =>
              table.getColumn('firstName')?.setFilterValue(event.target.value)
            }
            className='max-w-sm'
          />
        </div>
        <div className='flex'>
          <SquarePlus
            className='ml-2 cursor-pointer'
            onClick={table?.options?.meta?.addRow}
          />
          <Save className='ml-3 cursor-pointer' onClick={onSave} />
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
