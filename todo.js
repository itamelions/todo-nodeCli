#!/usr/bin/env node
const commands = ['new', 'get', 'complete', 'help']
const chalk = require('chalk')
const rl = require('readline');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const args = process.argv
const adapter = new FileSync('db.json')
const db = low(adapter)

// usage represents the help guide
const usage = function() {
  const usageText = `
  todo helps you manage you todo tasks.

  usage:
    todo <command>

    commands can be:

    new:      used to create a new todo
    get:      used to retrieve your todos
    complete: used to mark a todo as complete
    help:     used to print the usage guide
  `

  console.log(usageText)
}


// used to log errors to the console in red color
function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

if (commands.indexOf(args[2]) == -1) {
    errorLog('invalid command passed')
    usage()
  }

// we make sure the length of the arguments is exactly three
if (args.length > 3 && args[2] != 'complete') {
  errorLog('only one argument can be accepted')
  usage()
  return
}

switch(args[2]) {
    case 'help':
      usage()
      break
    case 'new':
        newTodo()
        break
    case 'get':
        getTodos()
        break
    case 'complete':
        completeTodo()
        break
    default:
      errorLog('invalid command passed')
      usage()
  }





// Set some defaults (required if your JSON file is empty)
db.defaults({ todos: []}).write()


function prompt(question) {
    const r = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    return new Promise((resolve, error) => {
      r.question(question, answer => {
        r.close()
        resolve(answer)
      });
    })
  }


  function newTodo() {
    const q = chalk.blue('Type in your todo\n')
  prompt(q).then(todo => {
    // add todo
    db.get('todos')
      .push({
      title: todo,
      complete: false
      })
      .write()
  })
  }

  function getTodos() {
    const todos = db.get('todos').value()
    let index = 1;
    todos.forEach(todo => {
      let todoText = `${index++}. ${todo.title}`
      if (todo.complete) {
        todoText += ' ✔ ️' // add a check mark
      }
      console.log(chalk.strikethrough(todoText))
    })
    return
  }

  function completeTodo() {
    // check that length
    if (args.length != 4) {
      errorLog("invalid number of arguments passed for complete command")
      return
    }
  
    let n = Number(args[3])
    // check if the value is a number
    if (isNaN(n)) {
      errorLog("please provide a valid number for complete command")
      return
    }
  
    // check if correct length of values has been passed
    let todosLength = db.get('todos').value().length
    if (n > todosLength) {
      errorLog("invalid number passed for complete command.")
      return
    }
  
    // update the todo item marked as complete
    db.set(`todos[${n-1}].complete`, true).write()
  }