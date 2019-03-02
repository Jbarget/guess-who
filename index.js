const getInitialState = (gameNames, numberOfRounds) => {
  const shuffledRounds = shuffleArray(gameNames)
  return {
    correct: [],
    incorrect: [],
    roundNumber: -1,
    rounds: numberOfRounds === 'max' ? shuffledRounds : shuffledRounds.slice(0, numberOfRounds)
  }
}

const setNumberOfRounds = (event) => {
  const numberOfRounds = event.target.id
  document.getElementById('header').classList.add(numberOfRounds)
  startGame(numberOfRounds, getInitialState)
}

const showScreen = (screenId) => {
  const screenIds = ['home-screen', 'game-screen', 'end-screen']
  document.getElementById(screenId).classList.remove('hide')

  screenIds
    .filter(screen => screen !== screenId)
    .forEach(screenId => document.getElementById(screenId).classList.add('hide'))
}

const resetAnswerClasses = () => {
  const nameButtons = document.querySelectorAll('.userName')
  nameButtons.forEach(button => {
    button.classList.remove('correctAnswer')
    button.classList.remove('incorrectAnswer')
  })
}

const handleQuitClick = (roundHandler, advanceRound) => () => {
  showScreen('home-screen')
  const nameButtons = document.querySelectorAll('.userName')
  nameButtons.forEach((button) => {
    button.removeEventListener('click', roundHandler)
  })
  document.getElementById('next-button').removeEventListener('click', advanceRound)
}

const shuffleArray = (array) => {
  var currentIndex = array.length
  var temporaryValue
  var randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

const init = () => {
  document.querySelectorAll('.roundButton')
    .forEach(button => button.addEventListener('click', setNumberOfRounds))
}

const checkIndex = ({ nameToAvoid, namesBySex, randomIndexArray }) => {
  const arrayLength = namesBySex.length
  const generateIndex = () => Math.floor(Math.random() * arrayLength)
  const index = generateIndex()
  if (namesBySex[index] === nameToAvoid || randomIndexArray.includes(index)) {
    return checkIndex({ nameToAvoid, namesBySex, randomIndexArray })
  }
  return index
}

const generateRandomIndexArray = ({ nameToAvoid, namesBySex }) => {
  let randomIndexArray = []
  while (randomIndexArray.length < 3) {
    const index = checkIndex({ nameToAvoid, namesBySex, randomIndexArray })
    randomIndexArray.push(index)
  }

  return randomIndexArray
}

const namesBySex = {
  'M': people.filter((person, i) => person.sex === 'M'),
  'F': people.filter((person, i) => person.sex === 'F')
}

const gameNames = people.map(({ name, image, sex }, i) => {
  return {
    realName: name,
    image: image,
    names: generateRandomIndexArray({ nameToAvoid: name, namesBySex: namesBySex[sex] })
      .map(index => namesBySex[sex][index].name)
  }
})

const newRound = (rounds, getRoundNumber) => {
  const roundNumber = getRoundNumber()
  const currentRound = rounds[roundNumber]
  const namesToPlay = shuffleArray(currentRound.names.concat([currentRound.realName]))
  const nameButtons = document.querySelectorAll('.userName')

  document.getElementById('next-button').classList.add('hide')
  document.getElementById('current-round').textContent = roundNumber + 1
  nameButtons.forEach((button, i) => {
    button.textContent = namesToPlay[i]
    button.disabled = false
  })
  document.getElementById('user-image').src = currentRound.image
}

const handleNameClick = ({ rounds, addCorrect, addIncorrect, getRoundNumber, getIsLastRound }) => (event) => {
  const roundNumber = getRoundNumber()
  const round = rounds[roundNumber]
  const isLastRound = getIsLastRound()
  const arrayOfNameButtons = Array.from(document.getElementsByClassName('userName'))
  const nextButton = document.getElementById('next-button')

  nextButton.classList.remove('hide')
  if (isLastRound) {
    nextButton.textContent = 'Finish'
  }

  arrayOfNameButtons.forEach((button) => button.disabled = true)
  if (event.target.textContent === round.realName) {
    event.target.classList.add('correctAnswer')
    addCorrect()
    return
  }
  event.target.classList.add('incorrectAnswer')
  arrayOfNameButtons
    .find((button) => button.textContent === rounds[roundNumber].realName)
    .classList
    .add('correctAnswer')
  return addIncorrect()
}

const handleNextClick = ({ rounds, getRoundNumber, incRoundNumber, getIsLastRound, getIncorrect }) => () => {
  const isLastRound = getIsLastRound()
  incRoundNumber()
  resetAnswerClasses()

  if (isLastRound) {
    const incorrect = getIncorrect()
    const incorrectAnswersList = document.getElementById('incorrect-answers')
    while (incorrectAnswersList.firstChild) {
      incorrectAnswersList.removeChild(incorrectAnswersList.firstChild)
    }
    fastdom.mutate(() => {
      incorrect.forEach(incorrectAnswer => {
        const node = document.createElement('LI')
        const imgNode = document.createElement('IMG')
        const span = document.createElement('SPAN')
        const textNode = document.createTextNode(incorrectAnswer.realName)
        imgNode.src = incorrectAnswer.image
        imgNode.class = 'incorrectAnswerImg'
        textNode.class = 'incorrectAnswerName'

        node.appendChild(imgNode)
        span.appendChild(textNode)
        node.appendChild(span)
        incorrectAnswersList.appendChild(node)
      })
      document.getElementById('score').textContent = rounds.length - incorrect.length
    })
    return showScreen('end-screen')
  }
  newRound(rounds, getRoundNumber)
}

const startGame = (numberOfRoundsString, getInitialState) => {
  let { correct, incorrect, roundNumber, rounds } = getInitialState(gameNames, numberOfRoundsString)
  const numberOfRounds = rounds.length
  const addCorrect = () => correct = correct.concat([rounds[roundNumber]])
  const addIncorrect = () => incorrect = incorrect.concat([rounds[roundNumber]])
  const getRoundNumber = () => roundNumber
  const getIncorrect = () => incorrect
  const incRoundNumber = () => roundNumber++
  const getIsLastRound = () => roundNumber === numberOfRounds - 1

  const roundHandler = handleNameClick({ rounds, addCorrect, addIncorrect, getRoundNumber, getIsLastRound })
  const advanceRound = handleNextClick({ rounds, getRoundNumber, incRoundNumber, getIsLastRound, getIncorrect })
  const nameButtons = document.querySelectorAll('.userName')

  nameButtons.forEach((button) => {
    button.addEventListener('click', roundHandler)
  })
  document.getElementById('total-score').textContent = numberOfRounds
  document.getElementById('total-rounds').textContent = numberOfRounds
  document.getElementById('next-button').addEventListener('click', advanceRound)
  document.getElementById('quit-button').addEventListener('click', handleQuitClick(roundHandler, advanceRound))
  document.getElementById('restart-button').addEventListener('click', handleQuitClick(roundHandler, advanceRound))
  document.getElementById('next-button').textContent = 'Next'

  advanceRound(rounds, roundNumber)
  showScreen('game-screen')
}

init()
