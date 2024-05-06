'use client'

import { columns } from './columns'
import { DataTable } from '@/components/data-table'
import { users as defaultData } from './data'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function Page() {
  const [data, setData] = useState<any>([])

  useEffect(() => {
    if (localStorage.getItem('users') !== null) {
      const parseData = JSON.parse(localStorage.getItem('users') || '[]')
      setData(parseData)
    } else {
      setData(defaultData)
    }
  }, [])

  return (
    <section className='py-24'>
      <div className='container'>
        <h1 className='mb-6 text-3xl font-bold'>All Users Ambisius</h1>
        {data.length >= 1 && <DataTable columns={columns} data={data} />}
      </div>
      <Toaster />
    </section>
  )
}
