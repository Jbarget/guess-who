const setNumberOfRounds = (event) => {
  const numberOfRounds = event.target.id
  document.getElementById('total-rounds').textContent = numberOfRounds
  document.getElementById('total-score').textContent = numberOfRounds
  document.getElementById('header').classList.add(numberOfRounds)
  startGame(numberOfRounds)
}

const showScreen = (screenId) => {
  const screenIds = ['home-screen', 'game-screen', 'end-screen']
  document.getElementById(screenId).classList.remove('hide')

  screenIds
    .filter(screen => screen !== screenId)
    .forEach(screenId => document.getElementById(screenId).classList.add('hide'))
}

const handleQuitClick = () => {
  showScreen('home-screen')
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
  Array.from(document.getElementsByClassName('roundButton'))
    .forEach(button => button.addEventListener('click', setNumberOfRounds))

  document.getElementById('quit-button').addEventListener('click', handleQuitClick)
  document.getElementById('restart-button').addEventListener('click', handleQuitClick)
}

const humans = {
  'Jamie one': './images/one.jpg',
  'Jamie two': './images/one.jpg',
  'Jamie three': './images/one.jpg',
  'Jamie four': './images/one.jpg',
  'Jamie five': './images/one.jpg',
  'Jamie six': './images/one.jpg'
}
const names = Object.keys(humans)
const numberOfNames = names.length

const generateRandomIndex = (indexToAvoid) => {
  const randomIndex = Math.floor(Math.random() * numberOfNames)
  // if (randomIndex === indexToAvoid) {
  //   return generateRandomIndex(indexToAvoid)
  // }
  return randomIndex
}

const gameNames = names.map((name, i) => {
  return {
    realName: name,
    image: humans[name],
    names: [
      names[generateRandomIndex(i)],
      names[generateRandomIndex(i)],
      names[generateRandomIndex(i)]
    ]
  }
})

const newRound = (rounds, getRoundNumber) => {
  const roundNumber = getRoundNumber()
  const currentRound = rounds[roundNumber]
  console.log({ roundNumber });
  const namesToPlay = shuffleArray(currentRound.names.concat([currentRound.realName]))
  const arrayOfNameButtons = Array.from(document.getElementsByClassName('userName'))

  document.getElementById('next-button').classList.add('hide')
  document.getElementById('current-round').textContent = roundNumber
  arrayOfNameButtons.forEach((button, i) => {
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
  console.log({ isLastRound });
  if (isLastRound) {
    const incorrect = getIncorrect()

    fastdom.mutate(() => {
      incorrect.forEach(incorrectAnswer => {
        const node = document.createElement('LI')
        const imgNode = document.createElement('IMG')
        var textNode = document.createTextNode(incorrectAnswer.realName)
        imgNode.src = incorrectAnswer.image
        imgNode.class = 'incorrectAnswerImg'
        textNode.class = 'incorrectAnswerName'

        node.appendChild(textNode)
        node.appendChild(imgNode)
        document.getElementById('incorrect-answers').appendChild(node)
      })
      document.getElementById('score').textContent = rounds.length - incorrect.length
    })
    return showScreen('end-screen')
  }
  newRound(rounds, getRoundNumber)
}

const startGame = (numberOfRoundsString) => {
  let roundNumber = -1
  const numberOfRounds = Number(numberOfRoundsString)
  const rounds = shuffleArray(gameNames).slice(0, numberOfRounds)
  let correct = []
  let incorrect = []
  const addCorrect = () => correct = correct.concat([rounds[roundNumber]])
  const addIncorrect = () => incorrect = incorrect.concat([rounds[roundNumber]])
  const getRoundNumber = () => roundNumber
  const getIncorrect = () => incorrect
  const incRoundNumber = () => roundNumber++
  const getIsLastRound = () => roundNumber === numberOfRounds - 1

  const roundHandler = handleNameClick({ rounds, addCorrect, addIncorrect, getRoundNumber, getIsLastRound })
  const advanceRound = handleNextClick({ rounds, getRoundNumber, incRoundNumber, getIsLastRound, getIncorrect })
  document.getElementById('namesContainer').addEventListener('click', roundHandler)
  document.getElementById('next-button').addEventListener('click', advanceRound)

  // const toggleAnswered = () => answered = !answered
  advanceRound(rounds, roundNumber)
  showScreen('game-screen')
}

init()
