import { yupResolver } from '@hookform/resolvers/yup'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { tutorApi } from '../../../api/tutor.api'
import InputNumber from '../../../components/InputNumber'
import { AppContext } from '../../../context/app.context'
import { serviceSchema } from '../../../utils/rules'
import Schedule from '../components/Schedule/Schedule'
import { ServiceTutorGet } from '../../../types/request.type'
import TextArea from 'antd/es/input/TextArea'

interface Props {
  onClose: () => void
  idService?: string
  refetch?: () => void
  initialData?: ServiceTutorGet
}

interface FormData {
  pricePerHour: number
  title: string
  subject: string
  class: '10' | '11' | '12'
  description: string
  learningMethod: 'Dạy trực tiếp(offline)' | 'Dạy trực tuyến (online)' | ''
  schedule: ScheduleType[]
}

interface ScheduleType {
  date: string
  timeSlots: string[]
}

const schema = serviceSchema

export default function ServiceForm({
  onClose,
  idService,
  refetch,
  initialData
}: Props) {
  const { profile } = useContext(AppContext)
  const [subjects, setSubjects] = useState<string[]>([])

  const { data: profileTutor, error: queryError } = useQuery({
    queryKey: ['Account', profile?.id as string],
    queryFn: () => tutorApi.getProfileTT(profile?.id as string),
    enabled: !!profile?.id,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    if (profileTutor?.subjects) {
      setSubjects(
        profileTutor.subjects.split(';').map((subject) => subject.trim())
      )
    }
  }, [profileTutor?.subjects])

  const transformInitialData = (data?: ServiceTutorGet): FormData => ({
    pricePerHour: data?.serviceDetails.pricePerHour || 0,
    title: data?.serviceDetails.title || '',
    subject: data?.serviceDetails.subject || '',
    class: (data?.serviceDetails.class || '10') as '10' | '11' | '12',
    description: data?.serviceDetails.description || '',
    learningMethod: (data?.serviceDetails.learningMethod || '') as
      | 'Dạy trực tiếp(offline)'
      | 'Dạy trực tuyến (online)'
      | '',
    schedule: data?.serviceDetails.schedule || []
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: transformInitialData(initialData)
  })

  useEffect(() => {
    if (initialData) {
      reset(transformInitialData(initialData))
    }
  }, [initialData, reset])

  const addServiceMutation = useMutation({
    mutationFn: (body: FormData) =>
      tutorApi.createService(profile?.id as string, body)
  })

  const editServiceMutation = useMutation({
    mutationFn: (body: FormData) =>
      tutorApi.updateService(idService as string, body)
  })

  const onSubmit = (data: FormData) => {
    console.log('data', data)

    if (idService) {
      if (refetch) {
        editServiceMutation.mutate(data, {
          onSuccess: (data) => {
            toast.success(data.data.message)
            onClose()
            refetch()
          },
          onError: (error) => {
            toast.error(error.message)
          }
        })
      }
    } else {
      addServiceMutation.mutate(data, {
        onSuccess: (data) => {
          toast.success(data.data.message)
          onClose()
          reset()
        },
        onError: (error) => {
          toast.error(error.message)
        }
      })
    }
  }

  const handleLearningMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setValue('learningMethod', e.target.value as any)
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('class', e.target.value as any)
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
      <div className='p-6 h-[42rem] w-full max-w-4xl bg-slate-100 overflow-y-auto shadow-lg mx-auto rounded-lg transition-shadow hover:border-white'>
        <h2 className='text-2xl font-bold mb-4'>
          {idService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-6'>
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700'
              >
                Tiêu đề
              </label>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <TextArea
                    id='title'
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className='text-red-500'>{errors.title.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='subject'
                className='block text-sm font-medium text-gray-700'
              >
                Môn học
              </label>
              <select
                id='subject'
                className='mt-1 block h-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                {...register('subject')}
              >
                <option value=''>Chọn môn học</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className='text-red-500'>{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='class'
                className='block text-sm font-medium text-gray-700'
              >
                Lớp
              </label>
              <select
                id='class'
                className='mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                {...register('class')}
                onChange={handleClassChange}
              >
                <option value='10'>10</option>
                <option value='11'>11</option>
                <option value='12'>12</option>
              </select>
              {errors.class && (
                <p className='text-red-500'>{errors.class.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='learningMethod'
                className='block text-sm font-medium text-gray-700'
              >
                Phương thức học
              </label>
              <select
                id='learningMethod'
                className='mt-1 block h-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                {...register('learningMethod')}
                onChange={handleLearningMethodChange}
              >
                <option value=''>Chọn phương thức học</option>
                <option value='Dạy trực tiếp(offline)'>
                  Dạy trực tiếp(offline)
                </option>
                <option value='Dạy trực tuyến (online)'>
                  Dạy trực tuyến (online)
                </option>
              </select>
              {errors.learningMethod && (
                <p className='text-red-500'>{errors.learningMethod.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='pricePerHour'
                className='block text-sm font-medium text-gray-700'
              >
                Giá mỗi giờ (VNĐ)
              </label>
              <Controller
                name='pricePerHour'
                control={control}
                render={({ field }) => (
                  <InputNumber
                    id='pricePerHour'
                    min={20000}
                    value={field.value}
                    onChange={field.onChange}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                )}
              />
              {errors.pricePerHour && (
                <p className='text-red-500'>{errors.pricePerHour.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700  '
              >
                Mô tả
              </label>
              <textarea
                id='description'
                rows={4}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2'
                {...register('description')}
              ></textarea>
              {errors.description && (
                <p className='text-red-500'>{errors.description.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='schedule'
                className='block text-sm font-medium text-gray-700'
              >
                Lịch học
              </label>
              <Controller
                name='schedule'
                control={control}
                render={({ field }) => (
                  <Schedule value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.schedule && (
                <p className='text-red-500'>{errors.schedule.message}</p>
              )}
            </div>

            <div className='flex justify-end'>
              <button
                type='button'
                onClick={onClose}
                className='bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 mr-2'
              >
                Hủy bỏ
              </button>
              <button
                type='submit'
                className='bg-pink-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700'
              >
                {idService ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
