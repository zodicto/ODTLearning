import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { tutorApi } from '../../../api/tutor.api'
import { AppContext } from '../../../context/app.context'
import { ServiceTutorGet } from '../../../types/request.type'
import ScheduleFormToChoose from '../components/ScheduleFormToChose'
import ServiceForm from '../ServiceForm'

export default function TutorViewOwnService() {
  const { profile } = useContext(AppContext)
  const [selectedClassIndex, setSelectedClassIndex] = useState<number | null>(
    null
  )
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>('')
  const [classData, setClassData] = useState<ServiceTutorGet[]>([])
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingServiceData, setEditingServiceData] =
    useState<ServiceTutorGet | null>(null)

  const [showFormService, setShowFormSerivce] = useState(false)

  //  đóng form (bấm hủy)
  const handleCloseForm = () => {
    setShowFormSerivce(false)
  }

  const { data: services, refetch } = useQuery({
    queryKey: ['allServiceOfTutor'],
    queryFn: () => tutorApi.getSerivceByTutor(profile?.id as string),
    enabled: !!profile?.id
  })

  useEffect(() => {
    if (services) {
      setClassData(services)
    }
  }, [services])

  useEffect(() => {
    if (editingServiceId) {
      const selectedService = classData.find(
        (service) => service.id === editingServiceId
      )
      setEditingServiceData(selectedService || null)
    }
  }, [editingServiceId, classData])

  const handleDateChange = (classIndex: number, date: string) => {
    setSelectedClassIndex(classIndex)
    setSelectedDate(date)
    setSelectedTimeSlot(null)
  }

  const handleTimeSlotChange = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
  }

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { weekday: 'long' })
  }

  const deleteServiceMutation = useMutation({
    mutationFn: (idService: string) => tutorApi.deleteTutorService(idService)
  })

  const handleDeleteService = (id: string) => {
    deleteServiceMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Xóa dịch vụ thành công')
        refetch()
      },
      onError: (data) => {
        toast.error(data.message)
      }
    })
  }

  const handleEditService = (id: string) => {
    setEditingServiceId(id) // Set editingServiceId when editing a service
    setShowFormSerivce(true)
  }

  return (
    <div className='w-2/3 border mx-auto grid gap-4'>
      <div className='text-wrap border-b-2 border bg-slate-50'>
        Danh sách dịch vụ của bạn
      </div>
      <hr />
      {classData.map((item, classIndex) => (
        <div
          key={classIndex}
          className='w-full bg-transparent border-2 rounded-2xl grid grid-cols-2 hover:shadow-xl transition-shadow translate-x-4 duration-700 shadow-md gap-2 bg-white'
        >
          <div className='col-span-1 p-4'>
            <h2 className='text-xl font-bold mb-2'>
              {item.serviceDetails.title}
            </h2>
            <div className='pl-10 p-7 bg-gray-100 rounded-lg shadow-md'>
              <div className='text-left h-full mx-auto'>
                <p className='mb-2'>
                  <strong className='text-pink-500'>Tiêu đề:</strong>{' '}
                  <span
                    className={
                      item.serviceDetails.title
                        ? 'text-gray-800'
                        : 'text-red-500'
                    }
                  >
                    {item.serviceDetails.title
                      ? item.serviceDetails.title
                      : 'Title trống'}
                  </span>
                </p>
                <p className='mb-2'>
                  <strong className='text-blue-700'>Môn học:</strong>{' '}
                  <span className='text-gray-800'>
                    {item.serviceDetails.subject}
                  </span>
                </p>
                <p className='mb-2'>
                  <strong className='text-blue-700'>Lớp:</strong>{' '}
                  <span className='text-gray-800'>
                    {item.serviceDetails.class}
                  </span>
                </p>
                <p className='mb-2'>
                  <strong className='text-blue-700'>Phương thức học:</strong>{' '}
                  <span className='text-gray-800'>
                    {item.serviceDetails.learningMethod}
                  </span>
                </p>
                <p className='mb-2'>
                  <strong className='text-blue-700'>Giá trên một giờ:</strong>{' '}
                  <span className='text-green-700'>
                    {item.serviceDetails.pricePerHour} VNĐ
                  </span>
                </p>
                <p>
                  <strong className='text-blue-700'>Mô tả:</strong>{' '}
                  <span className='text-gray-800'>
                    {item.serviceDetails.description}
                  </span>
                </p>
              </div>
            </div>
            <div className='flex justify-between mt-4'>
              <button
                onClick={() => handleEditService(item.id)} // Pass service id to handleEditService
                className='bg-yellow-600 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-700'
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDeleteService(item.id)} // Pass service id to handleDeleteService
                className='bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700'
              >
                Xóa dịch vụ
              </button>
            </div>
          </div>
          <div className='col-span-1 p-4'>
            <p>
              <strong>Thời gian:</strong>
            </p>
            <ScheduleFormToChoose
              schedule={item.serviceDetails.schedule}
              classIndex={classIndex}
              selectedDate={
                selectedClassIndex === classIndex ? selectedDate : ''
              }
              handleDateChange={handleDateChange}
              handleTimeSlotChange={handleTimeSlotChange}
              getDayOfWeek={getDayOfWeek}
            />
          </div>
        </div>
      ))}
      {editingServiceData && showFormService && (
        <ServiceForm
          refetch={refetch}
          idService={editingServiceId as string} // Pass editing service id to CreateService
          onClose={handleCloseForm} // Reset editingServiceId to null to close modal
          initialData={editingServiceData as ServiceTutorGet} // Pass the initial data to CreateService
        />
      )}
    </div>
  )
}
