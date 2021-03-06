import React, { useEffect, useState, useContext, useRef } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import { MuiButton } from 'components'
import { withInfo } from 'components/HOC/hoc'
import { CardText } from '../Dictionary'
import { ProgressChart } from '../Progress'
import { PlayImage, PlayFooter, PlayGuessField } from '.'
import { getAudio } from 'lib/helpers'
import { getRepetitionTime, saveSettings } from 'lib'

import { Context } from 'context'

import './play-card.less'

import { saveStatistic } from 'lib'
import { learnWordsStatistic, learnWordsPerDay } from 'lib/helpers/statisticHelp'

const useStyles = makeStyles((theme) => ({
  btnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.up('xs')]: {
      padding: '1.6rem 0',
    },
    [theme.breakpoints.up('sm')]: {
      padding: '1.6rem',
    },
    [theme.breakpoints.up('md')]: {
      padding: '1.6rem 0',
    },
    padding: '1.6rem 0',

    '& .btn-wrapper > *': {
      marginRight: '0.8rem',
    },
  },
  gameboard: {
    [theme.breakpoints.up('xs')]: {
      padding: '0 2.4rem',
    },
    [theme.breakpoints.up('md')]: {
      padding: '0',
    },
  },

  styleDictionary: {
    padding: '2rem 0',
    '& p.sentence': {
      fontFamily: theme.props.secondFont,
      fontSize: '1.8rem',
      lineHeight: '3.0rem',
      marginBottom: '1rem',
      '& b': {
        fontWeight: 'bold',
        color: theme.palette.common.success,
      },
      '& i': {
        fontStyle: 'italic',
        color: theme.palette.common.success,
      },
    },
    '& p.translation': {
      fontSize: '1.8rem',
      lineHeight: '2.2rem',
      color: theme.palette.common.textAdd,
    },
  },
}))

const PlayCardComponent = ({ word, next, updateWordsDB, showInfo }) => {
  const {
    cardSettings,
    setCardSettings,
    appStatistics,
    setAppStatistics,
    cardSettings: {
      showDefenition,
      REPEATbutton,
      HARDbutton,
      SHOWANSWERbutton,
      EASYbutton,
      addIllustration,
      defenitionTranslation,
      totalLearned,
      todayLearned,
    },
  } = useContext(Context)

  const classes = useStyles()
  const [audioWord, setAudioWord] = useState(null)
  const [audioMeaning, setAudioMeaning] = useState(null)
  const [audioExample, setAudioExample] = useState(null)
  const [isAudioLock, setAudioLock] = useState(true)
  const [isImageMinimized, setImageMinimized] = useState(false)

  const [isGuessed, setIsGuessed] = useState(false)
  const [isGiveUp, setIsGiveUp] = useState(false)

  let isMounted = false

  //   ---------------------------------function for storing words into statistic
  const createStatistic = (bool) => {
    const idword = word.id || word._id

    const options = {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
    }
    const date = new Date(Date.now() - 20031).toLocaleString('en', options)
    const newStatistic = {
      ...appStatistics,
      [idword]: learnWordsStatistic(appStatistics, idword, bool),
      [date]: learnWordsPerDay(appStatistics, date, idword, bool),
    }

    setAppStatistics(newStatistic)
    saveStatistic(newStatistic)
  }

  useEffect(() => {
    isMounted = true
    getAudio(word.audio).then((url) => {
      isMounted && setAudioWord(url)
    })
    showDefenition &&
      getAudio(word.audioMeaning).then((url) => {
        isMounted && setAudioMeaning(url)
      })
    getAudio(word.audioExample).then((url) => {
      isMounted && setAudioExample(url)
    })

    // set total counter
    const date = new Date(Date.now()).toDateString()
    const updatedTodayLearned = { ...todayLearned }
    if (updatedTodayLearned.date === date) {
      updatedTodayLearned.count = updatedTodayLearned.count + 1
    } else {
      updatedTodayLearned.date = date
      updatedTodayLearned.count = 0
    }

    const updatedSettings = { ...cardSettings, totalLearned: totalLearned + 1, todayLearned: updatedTodayLearned }
    setCardSettings(updatedSettings)
    saveSettings(updatedSettings)

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isGiveUp) {
      word.learnIndex = 0
      word.nextRepeat = getRepetitionTime(word.learnIndex)
      updateWordsDB(word)
    } else if (isGuessed === true) {
      word.learnIndex = word.learnIndex + 20 <= 100 ? word.learnIndex + 20 : 100
      word.nextRepeat = getRepetitionTime(word.learnIndex)
      createStatistic(true)
      updateWordsDB(word)
    } else if (isGuessed !== false) {
      word.learnIndex = word.learnIndex - 20 > 0 ? word.learnIndex - 20 : 0
      word.nextRepeat = getRepetitionTime(word.learnIndex)
      createStatistic(false)
      updateWordsDB(word)
    }
  }, [isGuessed, isGiveUp])

  const showMessage = (type) => {
    switch (type) {
      case 'hard':
        showInfo({ message: `Word added to the list of Hard Words`, type: 'success' })
        break
      case 'repeat':
        showInfo({ message: `Word added to the Repetition list`, type: 'success' })
        break
      case 'easy':
        showInfo({ message: `Word excluded from Learning list`, type: 'success' })
        break
    }

    word.status = type
    updateWordsDB(word)
  }
  return (
    <div className='play-card'>
      <div className='card-box'>
        <div className={classes.btnRow}>
          <div className='btn-wrapper card-wrapper'>
            {HARDbutton && (
              <MuiButton
                themeName='hard'
                action={() => {
                  showMessage('hard')
                }}
              >
                Hard
              </MuiButton>
            )}
            {REPEATbutton && (
              <MuiButton
                themeName='repeat'
                action={() => {
                  showMessage('repeat')
                }}
              >
                Repeat
              </MuiButton>
            )}
            {EASYbutton && (
              <MuiButton
                themeName='easy'
                action={() => {
                  showMessage('easy')
                }}
              >
                Easy
              </MuiButton>
            )}
          </div>
          {SHOWANSWERbutton && (
            <MuiButton themeName='answer' action={() => setIsGiveUp(true)}>
              Answer
            </MuiButton>
          )}
        </div>
        <div className='play-image'>
          {addIllustration && (
            <PlayImage src={word.image} isImageMinimized={isImageMinimized} setImageMinimized={setImageMinimized} />
          )}
        </div>
        <div className={`${classes.gameboard} card-wrapper`}>
          <CardText className='border-top-0' outerStyles={classes.styleDictionary} index='textExample' word={word}>
            <PlayGuessField
              word={word.word.toLowerCase()}
              setAudioLock={setAudioLock}
              setIsGuessed={setIsGuessed}
              isGuessed={isGuessed}
              showTheAnswer={isGiveUp}
            />
          </CardText>
          {showDefenition ? (
            <CardText
              className='second-row'
              outerStyles={classes.styleDictionary}
              index='textMeaning'
              word={
                isGuessed
                  ? { textMeaning: word.textMeaning, textMeaningTranslate: word.textMeaningTranslate }
                  : {
                      textMeaning: word.textMeaning.replace(
                        /(.*)(<i>.*<\/i>)(.*)/,
                        `$1<i>${'-'.repeat(word.word.length)}</i>$3`
                      ),
                      textMeaningTranslate: word.textMeaningTranslate,
                    }
              }
              defenitionTranslation={defenitionTranslation}
            />
          ) : null}
          <PlayFooter
            word={word}
            audio={
              isGuessed === true || isGiveUp === true ? audioExample : [audioWord, showDefenition ? audioMeaning : null]
            }
            isAudioLock={isAudioLock}
            isGuessed={isGuessed}
            showTheAnswer={isGiveUp}
            getResult={() => isGuessed}
            next={next}
          >
            <ProgressChart width={'36px'} value={word.learnIndex} />
          </PlayFooter>
        </div>
      </div>
    </div>
  )
}

export const PlayCard = withInfo(PlayCardComponent)
