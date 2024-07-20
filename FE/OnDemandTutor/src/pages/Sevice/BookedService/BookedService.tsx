import { useContext, useState, useMemo, useEffect } from 'react'
import { TutorRep, User, UserRep } from '../../../types/user.type'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { studentApi } from '../../../api/student.api'
import userApi from '../../../api/user.api'
import { toast } from 'react-toastify'
import DetailInfor from '../../MyClass/Detail' // sửa lại để xài chung
import { BookedServices } from '../../../types/request.type'
import ReviewService from '../ReviewService'
import { AppContext } from '../../../context/app.context'
import { Modal, Select } from 'antd'
import { statusClass } from '../../../constant/status.class'
import Pagination from '../../../components/Pagination'
import { roles } from '../../../constant/roles'

const { Option } = Select

export default function BookedService() {
  const { profile } = useContext(AppContext)

  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['Account'],
    queryFn: () => userApi.ViewClassService(profile?.id as string),
    enabled: !!profile?.id,
    placeholderData: keepPreviousData
  })

  const serviceMutation = useMutation({
    mutationFn: (idBook: string) => studentApi.serviceCompled(idBook)
  })

  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState<string | null>(null)
  const [showReview, setShowReview] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [completedServiceId, setCompletedServiceId] = useState<string | null>(
    null
  )
  const [searchSubject, setSearchSubject] = useState<string>('')
  const [searchId, setSearchId] = useState<string>('')
  const itemsPerPage = 4 // Số phần tử trên mỗi trang
  const [hasError, setHasError] = useState<boolean>(false)
  const serviceList: BookedServices[] = Array.isArray(data) ? data : []
  const subjects = useMemo(() => {
    if (!Array.isArray(serviceList)) return []
    return [...new Set(serviceList.map((service) => service.subject))]
  }, [serviceList])

  useEffect(() => {
    if (isError) {
      setHasError(true)
    }
  }, [isError])

  useEffect(() => {
    if (hasError) {
      const timeout = setTimeout(() => {
        window.location.reload()
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [hasError])

  const handleCompleteClass = (id: string) => {
    serviceMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Kết thúc lớp thành công')
        setSelectedService(id)
        setShowReview(id)
        setCompletedServiceId(id) // Mark service as completed
        refetch()
      },
      onError: (data) => {
        toast.error(data.message)
      }
    })
  }

  const handleOpenModal = (idBooking: string) => {
    setSelectedService(idBooking)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleReviewSubmit = (idRequest: string) => {
    setReviewSubmitted(idRequest)
    setShowReview(null)
  }

  // Lọc dữ liệu dịch vụ dựa trên môn học và ID tìm kiếm
  const filteredServices = useMemo(() => {
    return serviceList.filter(
      (service) =>
        (searchSubject === '' ||
          service.subject
            .toLowerCase()
            .includes(searchSubject.toLowerCase())) &&
        (searchId === '' ||
          service.idBooking.toLowerCase().includes(searchId.toLowerCase()))
    )
  }, [serviceList, searchSubject, searchId])

  // Tính toán số lượng phần tử trên từng trang
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem)

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className='container'>
      {isLoading ? (
        <div className='flex justify-center items-center h-40'>
          <span className='text-xl font-bold text-gray-600'>Loading...</span>
        </div>
      ) : (
        <div>
          <div className='mb-4 justify-center flex'>
            <Select
              placeholder='Chọn môn học'
              value={searchSubject}
              onChange={(value) => {
                setSearchSubject(value)
                setCurrentPage(1) // Reset to first page on search
              }}
              className='p-2 border border-gray-300 h-10 mr-2 w-64 overflow-x-auto'
            >
              <Option value=''>Tất cả</Option>
              {subjects.map((subject) => (
                <Option key={subject} value={subject}>
                  {subject}
                </Option>
              ))}
            </Select>
            <input
              type='text'
              placeholder='Tìm theo ID'
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className='p-2 border border-gray-300 rounded mr-2'
            />
          </div>
          {filteredServices.length === 0 ? (
            <div className='text-center text-red-500 mt-10 text-lg'>
              Bạn không có lớp học nào
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {currentItems.map((service: BookedServices) => (
                  <div
                    key={service.idBooking}
                    className='rounded-3xl w-[33rem] my-5 mx-auto p-5 hover:shadow-2xl hover:shadow-black transition-shadow duration-500'
                    onMouseEnter={() => setHovered(service.idBooking)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className='my-2'>
                      <h2 className='text-red-600 text-2xl'>{service.title}</h2>
                    </div>

                    <div className='text-[1rem] text-left'>
                      <div className='my-1'>
                        ID:{' '}
                        <span className='text-blue-500 font-bold text-md'>
                          {service.idBooking}
                        </span>
                      </div>
                      <div>
                        Môn dạy:{' '}
                        <span className='text-blue-500 font-bold text-md'>
                          {service.subject}
                        </span>
                      </div>

                      <div className='my-1'>
                        Lớp dạy:{' '}
                        <span className='text-blue-500 font-bold text-md'>
                          {service.class}
                        </span>
                      </div>
                      <div className='my-1'>
                        Giá toàn dịch vụ:{' '}
                        <span className='text-red-400 font-bold text-md'>
                          {service.price}
                        </span>{' '}
                        VNĐ
                      </div>
                      <div className='my-1'>
                        Ngày học:{' '}
                        <span className='text-black font-bold text-md'>
                          {service.date}
                        </span>
                      </div>
                      <div className='my-1'>
                        Thời gian bắt đầu:{' '}
                        <span className='text-black font-bold text-md'>
                          {service.timeSlot}
                        </span>
                      </div>

                      <div className='my-1'>
                        Hình thức:{' '}
                        <span className='text-black font-bold text-md'>
                          {service.learningMethod}
                        </span>
                      </div>
                      <div className='my-1'>
                        Mô tả:{' '}
                        <span className='text-black font-bold text-md'>
                          {service.description}
                        </span>
                      </div>

                      <div className='my-1'>
                        Trạng thái:{' '}
                        <span
                          className={`font-bold text-md ${
                            service.status.toLowerCase() ===
                            statusClass.complete
                              ? 'text-green-700'
                              : 'text-red-500'
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex mt-2 justify-between transition-max-height duration-300 ease-in-out ${
                        hovered === service.idBooking
                          ? 'max-h-20'
                          : 'max-h-0 overflow-hidden'
                      }`}
                    >
                      <div className='w-full flex items-center justify-center'>
                        {service.status.toLowerCase() ===
                        statusClass.pending ? (
                          <div className='flex justify-between w-full'>
                            <button
                              onClick={() => handleOpenModal(service.idBooking)}
                              className='w-[49%] bg-pink-400 text-white font-bold py-2 px-4 rounded-md hover:bg-pink-200'
                            >
                              Chi tiết
                            </button>

                            {reviewSubmitted != service.idBooking &&
                              service.status.toLowerCase() ===
                                statusClass.pending && (
                                <button
                                  onClick={() =>
                                    handleCompleteClass(service.idBooking)
                                  }
                                  className='w-[49%] bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-400'
                                >
                                  Kết thúc lớp
                                </button>
                              )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(service.idBooking)}
                            className='w-full bg-pink-400 text-white font-bold py-2 px-4 rounded-md hover:bg-pink-200'
                          >
                            Chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                    {showReview === service.idBooking && (
                      <ReviewService
                        idBooking={service.idBooking}
                        onSubmit={() => handleReviewSubmit(service.idBooking)}
                      />
                    )}
                    {isModalOpen && selectedService && (
                      <Modal
                        title='Chi tiết lớp học'
                        visible={isModalOpen}
                        onCancel={handleCloseModal}
                        className='min-w-[90rem]'
                        footer={null}
                      >
                        <DetailInfor
                          User={
                            currentItems.find(
                              (item) => item.idBooking === selectedService
                            )?.user as UserRep
                          }
                          Tutor={
                            currentItems.find(
                              (item) => item.idBooking === selectedService
                            )?.tutor as TutorRep
                          }
                        />
                      </Modal>
                    )}
                  </div>
                ))}
              </div>
              <Pagination
                totalItems={filteredServices.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
