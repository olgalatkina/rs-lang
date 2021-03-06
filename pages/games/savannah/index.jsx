import React, { useState, useEffect, useRef, useContext } from 'react'
import { GameStartModalWindow } from '../../../components/GameStartModalWindow'
import { StatisticGames } from '../../../components/statisticGames'
import { combineWords } from '../../../lib/crud/auth'
import { ButtonsList } from '../../../components/games/'

import './savannah.less'

import { Context } from 'context'
import { saveStatistic } from 'lib'
import { addToStatisticfunc, gamesMiniStatistic } from '../../../lib/helpers/statisticHelp'

import { getLocalStorageProp, setLocalStorageProp } from 'lib/localStorage'

const Savannah = (props) => {
  const [activeStep, setActiveStep] = useState(-1)
  const [playWord, setPlayWord] = useState(null)
  const [isResult, toggleResult] = useState(false)
  const [wordsList, setWordsList] = useState([])
  const [gameEnd, setGameEnd] = useState(false)

  const [mistakes, setMistakes] = useState(5)
  const [points, setPoints] = useState(0)

  const [allnotGuessed, setallnotGuessed] = useState([])
  const [allGuessed, setAllGuessed] = useState([])
  const [showResults, setShowResults] = useState(false)

  const wordsDeck = useRef()
  const Drop = useRef()
  const Counter = useRef()
  const isEnd = useRef()

  isEnd.current = false
  Counter.current = 0

  const { appStatistics, setAppStatistics } = useContext(Context)

  const createStatistic = () => {
    allGuessed.map((el) => {
      const newStatistic = { ...appStatistics, id: addToStatisticfunc(appStatistics, el.id, 'savannah', 'guessed') }
      setAppStatistics(newStatistic)
      saveStatistic(newStatistic)
    })
    allnotGuessed.map((el) => {
      const newStatistic = { ...appStatistics, id: addToStatisticfunc(appStatistics, el.id, 'savannah', 'wrong') }
      setAppStatistics(newStatistic)
      saveStatistic(newStatistic)
    })
    const newMiniGameStatistic = { ...appStatistics, 'savannah': gamesMiniStatistic(appStatistics, 'savannah', allGuessed.length, allnotGuessed.length) }
    setAppStatistics(newMiniGameStatistic)
    saveStatistic(newMiniGameStatistic)
  }


  const getRandomWord = () => {
    if (activeStep >= 9) {
      setShowResults(true)
      setGameEnd(true)
      createStatistic()
      return null
    }
    const idx = Math.floor(Math.random() * (wordsDeck.current.length - 1))
    if (!wordsDeck.current[idx].used) {
      const item = setWordAsUsed(idx)
      setPlayWord(item)
      return item
    }
    return getRandomWord()
  }

  const getRandomList = (word, arr = []) => {
    let randomList = arr
    while (randomList.length < 3) {
      const idx = Math.floor(Math.random() * (wordsDeck.current.length - 1))
      if (word !== wordsDeck.current[idx]) {
        randomList.push(idx)
      }
    }
    randomList = [...new Set(randomList)]
    return randomList.length === 3 ? randomList : getRandomList(word, randomList)
  }

  const setWordAsUsed = (idx) => {
    if (idx < 0 || idx > wordsDeck.current.length) throw Error(`Word index must be less than ${wordsDeck.length + 1}`)
    const word = wordsDeck.current[idx]
    word.used = true
    setActiveStep(activeStep + 1)
    return word
  }

  let timer

  const startTheTimer = () => {
    // Counter.current = 0
    if (isEnd.current) return 
    
    clearInterval(timer)
    timer = setInterval(() => {
      if (!Drop.current ) return
      Counter.current = Counter.current + 0.3
      Drop.current.style.top = `${Counter.current}rem`
      if (Counter.current >= 39) {
        isEnd.current = true
        clearInterval(timer)
        if(mistakes){
          toggleResult(false)
          setResult(playWord.id, false)
          Counter.current = 0
          startTheTimer()
        } else {
          Counter.current = 0
          return
        }
      }
    }, 30)
  }

  useEffect(() => {
    if (isResult) {
       toggleResult(false)
       setupPlayState()
    }
  }, [isResult])


  //  the end of game 
  useEffect(() => {
    if (!mistakes) {
      setGameEnd(true)
      clearInterval(timer)
      Counter.current = null
      setShowResults(true)
      setMistakes(1)
      return
    }
  }, [mistakes])

  const setupPlayState = () => {
    const word = getRandomWord()
    if (word) {
      const randomList = getRandomList(word.id).map((idx) => wordsDeck.current[idx])
      const place = Math.floor(Math.random() * 4)
      const newList = [...randomList]
      newList.splice(place, 0, word)
      toggleResult(false)
      setWordsList(newList)
    }
  }

  const setResult = (id, result) => {
    const word = wordsDeck.current.find((item) => item.id === id)
    if (result) {
      word.right = true
      setPoints((points) => points + 1)
      document.getElementById('yes').play() // useRef instead of getElementById
      setAllGuessed((gues) => {
        const wo = {}
        wo.word = word.word
        wo.transcription = word.transcription
        wo.translate = word.wordTranslate
        if(!gues.find(el => el.word === word.word)){
          return [...gues, wo]
        }
        return gues
      })
    } else {
      if(!mistakes-1){
        setMistakes(mistakes => mistakes - 1)
      }
      document.getElementById('no').play() // useRef instead of getElementById
      setallnotGuessed((gues) => {
        const wo = {}
        wo.word = word.word
        wo.transcription = word.transcription
        wo.translate = word.wordTranslate
        if(!gues.find(el => el.word === word.word)){
          return [...gues, wo]
        }
        return gues
      })
      word.wrong = true
    }
    setTimeout(() => {
      toggleResult(true)
    }, 500)
  }

  useEffect(() => {
    combineWords(1, 1)
      .then((data) => {
        wordsDeck.current = data
        setupPlayState()
      })
      .catch((error) => error)
  }, [])

  return (
    <div className='savannah'>
      <GameStartModalWindow gameId={1} startTheTimer={startTheTimer} nameOfGame={'savanna'} />
      {showResults && <StatisticGames allGuessed={allGuessed} allnotGuessed={allnotGuessed} />}

      <div className='savannah-main'>
        <div className='lifes'>
          <div className='score'>
            {mistakes ? Array(mistakes).fill(<img src='/images/savannah/heart.png' alt='picture' />) : ''}
          </div>
        </div>

        <div className='listOfWords'>
          <ul>
            {wordsList.length && (
              <ButtonsList
                playWord={playWord}
                list={wordsList}
                isResult={isResult}
                handleClick={({ target }) => {
                  if (target.dataset.id === playWord.id) {
                    setResult(playWord.id, true)
                  } else {
                    setResult(playWord.id, false)
                  }
                }}
              />
            )}
          </ul>
        </div>
      </div>

      <div className='drop'>
        {playWord ? (
          <div ref={Drop} className='drop-item'>
            <svg width='3rem' viewBox='0 0 30 42'>
              <path
                fill='#9ec6ea'
                stroke='#438ccd'
                strokeWidth='1.1'
                d='M15 3
                Q16.5 6.8 25 18
                A12.8 12.8 0 1 1 5 18
                Q13.5 6.8 15 3z'
              />
            </svg>
            <div className='fallingWord'>
              <span className='word-fall'>{playWord.word}</span>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>

      <div className='bucketOfFlowers'>
        <div className='score'>{Array(points).fill(<img src='/images/savannah/bucket.png' alt='points' />)}</div>
      </div>

      <audio src='../audio/drop.mp3' className='audio_word' id='yes'></audio>
      <audio src='../audio/boom.mp3' className='audio_word' id='no'></audio>
    </div>
  )
}

export default Savannah
