import Image from 'next/image'
import { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { createClient } from '@supabase/supabase-js'
import { SubmitHandler, useForm } from 'react-hook-form'

export async function getStaticProps() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
  )
  const { data } = await supabaseAdmin.from('images').select('*').order('id')
  return {
    props: {
      images: data,
    },
  }
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

type Image = {
  id: number
  imageSrc: string
  name: string
  username: string
}

export default function Gallery({ images }: { images: Image[] }) {
  const [localImages, setLocalImages] = useState(images)

  return (
    <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="flex flex-col items-center gap-10 mb-10">
        <Title />
        <Uploader amount={localImages.length} setLocalImages={setLocalImages} />
      </div>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {localImages ? (
          localImages.map((image) => <BlurImage key={image.id} image={image} />)
        ) : (
          <h1 className="font-semibold text-2xl">Images not found</h1>
        )}
      </div>
    </div>
  )
}

function BlurImage({ image }: { image: Image }) {
  const [isLoading, setLoading] = useState(true)

  return (
    <a target="_blank" href={image.imageSrc} className="group">
      <div>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          <Image
            alt=""
            src={image.imageSrc}
            layout="fill"
            objectFit="cover"
            className={cn(
              'duration-700 ease-in-out group-hover:opacity-75',
              isLoading
                ? 'scale-110 blur-2xl grayscale'
                : 'scale-100 blur-0 grayscale-0'
            )}
            onLoadingComplete={() => setLoading(false)}
          />
        </div>
        <h3 className="mt-4 text-sm text-gray-700">{image.name}</h3>
        <p className="mt-1 text-lg font-medium text-gray-900">
          {image.username}
        </p>
      </div>
    </a>
  )
}

function Title() {
  return <h1 className="font-semibold text-4xl text-center">Plants gallery</h1>
}

type Inputs = {
  imageSrc: string
  name: string
  username: string
  key: string
}

function Uploader({
  setLocalImages,
  amount,
}: {
  amount: number
  setLocalImages: Dispatch<SetStateAction<Image[]>>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const closeModal = () => {
    setIsOpen(false)
  }
  const openModal = () => {
    setIsOpen(true)
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (data.key !== 'on') {
      closeModal()
      return
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const item = {
      id: amount + 1,
      imageSrc: data.imageSrc,
      name: data.name || 'plant from anonymous',
      username: data.username || 'anonymous',
    }

    await supabaseAdmin.from('images').insert(item)
    setLocalImages((prev) => [...prev, item])
    closeModal()
  }

  return (
    <>
      <button
        onClick={openModal}
        className="bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 w-48 "
      >
        Upload
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col items-center gap-6"
                  >
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add new plant
                    </Dialog.Title>
                    <input
                      className={cn(
                        'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                      )}
                      {...register('imageSrc', {
                        pattern:
                          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
                        required: true,
                      })}
                      placeholder="Image link from Unsplash"
                      type="text"
                    />
                    <input
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      {...register('name')}
                      type="text"
                      placeholder="Give a name to image or not"
                    />
                    <input
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      {...register('username')}
                      type="text"
                      placeholder="Introduce yourself or not"
                    />
                    <input
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      {...register('key', { required: true })}
                      type="text"
                      placeholder="Your key"
                    />

                    <div className="mt-4">
                      <button
                        type="submit"
                        className="bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 w-36"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
