import { useEffect, useState } from 'react'
import numeral from 'numeral'

type Props = {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}

const NumberDynamic = ({ prefix = '', suffix = '', value, duration = 500 }: Props) => {
  const [newValue, setNewValue] = useState(0)

  const newValueFormatted = newValue < 1000 ? newValue : numeral(newValue).format('0,0')

  const stepDurationMs = 25

  const timeoutIds:any = []

  const grow = (growIncrement: number) => {
    const incrementedStep = Math.ceil(newValue + growIncrement)

    if (incrementedStep > value) {
      setNewValue(value)
      return false
    }

    setNewValue(incrementedStep)

    timeoutIds.push(
      setTimeout(() => {
        grow(growIncrement)
      }, stepDurationMs)
    )
  }

  useEffect(() => {
    grow(value / (duration / stepDurationMs))

    return () => {
      timeoutIds.forEach((tid:any) => {
        clearTimeout(tid)
      })
    }
  })

  return (
    <div>
      {prefix}
      {newValueFormatted}
      {suffix}
    </div>
  )
}

export default NumberDynamic
