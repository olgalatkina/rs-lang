import './cardToday.less'
import React, {useContext} from 'react'
import {Context} from 'context'
import { Doughnut } from 'react-chartjs-2'

const СardToday = ({
  newCards,
  winrate,
  totalCards,
  studyTime,
  strike,
  repeat,
  userName,
  result,
  amountOfWords,
  isEnd,
}) => {
  const data = {
    labels: ['New cards', 'Correct answers', 'Total cards'],
    datasets: [
      {
        data: [newCards, winrate, totalCards],
        backgroundColor: ['#C00000', '#38ADA9', '#1e658a'],
      },
    ],
  }

  const {repeatCount} = useContext(Context)

  const persent = Math.floor((winrate * 100) / totalCards).toFixed(0)

  const options = {
    tooltips: {
      enabled: true,
      backgroundColor: 'rgba(FF, 0, 0, 0.8)',
    },
  }

  return (
    <div className='tab'>
      {isEnd ? (
        <div className='congrats'>
          <p className='congrats__name'>
            Good job, <span>{userName}</span>!
          </p>
          <p className='congrats__text'>You've succeded your daily plan.</p>
          <br />
        </div>
      ) : null}
      <div className='doughnat-wrapper'>
        <Doughnut
          data={data}
          options={{
            legend: {
              display: false,
            },
            tooltips: {
              enabled: false,
            },
          }}
          width={500}
          height={500}
        />
        <div className='legend'>
          <p>
            <span className='legend-newWords'>{newCards}</span> New words
          </p>
          <p>
            <span className='legend-winrate'>{winrate}</span> Correct answers
          </p>
          <p>
            <span className='legend-totalCards'>{totalCards}</span> Cards
          </p>
        </div>
      </div>

      <div className='eagle'>
        <p className='eagle__text eagle__text_left'>Correct answers persent</p>
        <div className='eagle__digs'>
          <p className='eagle__dig'>{persent}</p>
          <p className='eagle__dig eagle__dig_right-wing'>{repeatCount}</p>
        </div>
        <p className='eagle__text'>Words for repetition</p>
      </div>
      <h2 className='studyTime'>
        Study time: <span>{studyTime}</span>
      </h2>
    </div>
  )
}
export default СardToday
