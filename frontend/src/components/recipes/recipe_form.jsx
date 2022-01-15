import React, {useState} from "react";
import { withRouter } from "react-router";
// import UserNavContainer from "../user_nav/user_nav_container";

const RecipeForm = props => {
  let {author} = props

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [whichFerment, setWhichFerment] = useState('yeast')

  const [numPizzas, setNumPizzas] = useState(null)
  const [pizzaSize, setPizzaSize] = useState(null)
  const [crustThickness, setCrustThickness] = useState('thin')

  const [fermentData, setFermentData] = useState({})
  const [bulkData, setBulkData] = useState({})
  const [extraData, setExtraData] = useState({})
  
  const [extraInputFields, setExtraInputFields] = useState([])

  const addExtraInputField = () => {
    if (extraInputFields.length < 4) {
      setExtraInputFields([...extraInputFields, {idx: (extraInputFields.length), extraName: '', extraQuantity: '', preferment: false}])
    } else {
      console.log('too many extras')
    }
  }

  const removeExtraInputField = idx => {
    const inputs = [...extraInputFields]
    const deleteIdx = inputs.findIndex(input => input.idx === idx)
    const inputObjNameKey = `extra${deleteIdx}Name`
    const inputObjQuantityKey = `extra${deleteIdx}Quantity`
    const newExtraData = Object.assign({}, extraData)
    delete newExtraData[inputObjNameKey]
    delete newExtraData[inputObjQuantityKey]
    setExtraData(newExtraData)
    inputs.splice(deleteIdx, 1)
    setExtraInputFields([...inputs])
  }
  
  const handleErrors = () => {
    return(
      <ul className='recipe error-list'>
        {props.errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
    )
  }
  
  const allowSubmit = () => {
    if (title.length > 0 && (Object.keys(fermentData).length > 0) && (Object.keys(bulkData).length > 0)) {
      return <input type="submit" form='recipe-form' className='text-right cursor-pointer font-medium text-gray-600 hover:text-black hover:italic' value='Publish' />
    } else {
      return <input type="submit" form='story-form' className='text-right font-medium text-gray-600' value='Publish' disabled/>
    }
  }

  const buildData = doughFactor => {
    const unitFermentData = {}
    const unitBulkData = {}
    const unitExtraData = {}
    const dataSets = [fermentData, bulkData, extraData]
    dataSets.forEach((dataSet, idx) => {
      let dataSetKeys = Object.keys(dataSet)
      let respectiveUnitData = [unitFermentData, unitBulkData, unitExtraData][idx]
      dataSetKeys.forEach((key) => {
        let currentValue = dataSet[key]
        if (!isNaN(parseFloat(currentValue))) {
          if (key == 'yeastQuantity') {
            respectiveUnitData[key] = parseFloat(currentValue) / doughFactor
          } else {
            respectiveUnitData[key] = parseFloat(currentValue) / doughFactor
          }
        } else {
          respectiveUnitData[key] = currentValue
        }
      })
    })
    return ({
      ferment: unitFermentData,
      bulk: unitBulkData,
      extra: unitExtraData
    })
  }     

  const handleSubmit = e => {
    e.preventDefault()
    /* DOUGH FACTOR 
      foolproof pan: 697g --> 2x 10" --> 157 in^2 --> 0.225 in^2/g
      my poolish dough: 311g --> 1x 14" --> 154 in^2 --> 0.495 in^2/g
      thick crust take 2.2x as much dough mass to cover a given area
      will increase dough factor so unit measurements are smaller
    */
    const pizzaDimensions = pizzaSize.match(/\d+\.\d+|\d+/g)
    let pizzaArea
    let pizzaSizeString
    let pie
    if (pizzaDimensions.length === 1) {
      pizzaArea = Math.pow((parseFloat(pizzaDimensions[0]) / 2), 2) * Math.PI
      pizzaSizeString = `${pizzaDimensions[0]}-inch`
      pie = 'pie'
    } else {
      pizzaArea = parseFloat(pizzaDimensions[0]) * parseFloat(pizzaDimensions[1])
      pizzaSizeString = `${pizzaDimensions[0]}-inch by ${pizzaDimensions[1]}-inch`
      pie = 'pies'
    }
    const doughFactor = parseInt(numPizzas) * pizzaArea * (crustThickness === 'thin' ? 1 : 2.2)
    props.action({
      author_id: author.id,
      title,
      body,
      original_proportion: `This recipe was originally made for ${numPizzas} ${pizzaSizeString} ${crustThickness}-crust ${pie}.`,
      data: buildData(doughFactor)
    })
      .then(res => props.history.push(`/recipes/${res.recipe.id}`))
  }

  const updateFerment = fermentOption => {
    setFermentData({})
    setWhichFerment(fermentOption)
  }

  const fermentedInputs = () => {
    if (!whichFerment) {return null}
    let formFermentContent
    if (whichFerment === 'yeast') {
      formFermentContent = (
        <div className="w-full grid grid-cols-2">
          <p className="inline-block w-20 whitespace-nowrap">Yeast</p>
          <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
            <input type="number" step="0.1"
              className='outline-0 w-20'
              form='recipe-form'
              onChange={update('ferment', 'yeastQuantity')}/>
            <p className="italic">grams</p>
          </div>
        </div>
      )
    } else if (whichFerment === 'preferment') {
      formFermentContent = (
        <div className='preferment-options'>
          <div className="w-full grid grid-cols-2">
            <input type="text"
              className="outline-0 w-11/12 mb-3 border-b-2 border-yellow-900"
              placeholder="Flour"
              onChange={update('ferment', 'flourType')}/>
            <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
              <input type="number"
                className="outline-0 w-20"
                onChange={update('ferment', 'flourQuantity')}/>
              <p className="italic">grams</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-2">
            <p className="inline-block w-20 whitespace-nowrap">Water</p>
            <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
              <input type="number"
                className="outline-0 w-20"
                onChange={update('ferment', 'waterQuantity')}/>
              <p className="italic">grams</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-2">
            <p className="inline-block w-20 whitespace-nowrap">Yeast</p>
            <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
              <input type="number"
                className="outline-0 w-20"
                step="0.1"
                onChange={update('ferment', 'yeastQuantity')}/>
              <p className="italic">grams</p>
            </div>
          </div>
        </div>
      )
    } else if (whichFerment === 'sourdough') {
      formFermentContent = (
        <div>
          <div className="w-full grid grid-cols-2">
            <p className="inline-block w-20 whitespace-nowrap">Hydration Percentage</p>
            <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
              <input type="number" min="1" max="100"
                className="outline-0 w-20"
                id="sourdough-hydration-percent"
                onChange={update('ferment', 'sourdoughHydration')}/>
              <p className="italic">%</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-2">
            <p className="inline-block w-20 whitespace-nowrap">Mass</p>
            <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
              <input type="number"
                className="outline-0 w-20"
                id="sourdough-mass"
                onChange={update('ferment', 'sourdoughQuantity')}/>
              <p className="italic">grams</p>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="preferment-content">
        {formFermentContent}
        {mapRespectiveExtraItems('preferment')}
      </div>
    )
  }

  const updateExtraInputPos = (pos, input) => {
    const newInputFields = [...extraInputFields]
    let newInput = Object.assign({}, extraInputFields[input.idx])
    newInput['preferment'] = (pos === 'preferment')
    newInputFields[input.idx] = newInput
    let dataNameKey = 'extra' + input.idx + 'Name'
    let dataQuantityKey = 'extra' + input.idx + 'Quantity'
    if (pos === 'preferment') {
      setFermentData(Object.assign(fermentData, {[dataNameKey]: extraData[dataNameKey]}))
      setFermentData(Object.assign(fermentData, {[dataQuantityKey]: extraData[dataQuantityKey]}))
      let newExtraData = Object.assign({}, extraData)
      delete newExtraData[dataNameKey]
      delete newExtraData[dataQuantityKey]
      setExtraData(newExtraData)
    } else if (pos === 'bulk') {
      setExtraData(Object.assign(extraData, {[dataNameKey]: fermentData[dataNameKey]}))
      setExtraData(Object.assign(extraData, {[dataQuantityKey]: fermentData[dataQuantityKey]}))
      let newFermentData = Object.assign({}, fermentData)
      delete newFermentData[dataNameKey]
      delete newFermentData[dataQuantityKey]
      setFermentData(newFermentData)
    }    
    setExtraInputFields(newInputFields)
  }

  const update = (section, field, input) => {
    return e => {
      let parsedInt = parseInt(e.target.value)
      let userInput = isNaN(parsedInt) ?
        e.target.value
        : (parsedInt === 0 ? parseFloat(e.target.value) : parsedInt)
      if (section === 'title') {
        setTitle(userInput)
      } else if (section === 'body') {
        setBody(userInput)
      } else if (section === 'ferment') {
        setFermentData(Object.assign(fermentData, { [field]: userInput }))
      } else if (section === 'bulk') {
        setBulkData(Object.assign(bulkData, { [field]: userInput }))
      } else if (section === 'extra') {
        setExtraData(Object.assign(extraData, { [field]: userInput }))
        const newInputFields = [...extraInputFields]
        let newInput = Object.assign({}, extraInputFields[input.idx])
        if (field.charAt(6) === 'N') {
          newInput['extraName'] = userInput
          newInputFields[input.idx] = newInput
          setExtraInputFields(newInputFields)
        } else {
          newInput['extraQuantity'] = userInput
          newInputFields[input.idx] = newInput
          setExtraInputFields(newInputFields)
        }
      }      
    }
  }

  const updateNumPizzas = () => {
    return e => {
      setNumPizzas(parseInt(e.target.value))
    }
  }

  const updatePizzaSize = () => {
    return e => {
      setPizzaSize(e.target.value)
    }
  }

  const updateThickness = () => {
    return e => {
      setCrustThickness(e.target.value)
    }
  }

  const mapRespectiveExtraItems = section => {
    return (extraInputFields
      .map((input, i) => Object.assign(input, { originalIndex: i }))
      .filter(input => section === 'preferment' ? input.preferment : !input.preferment)
      .map((input, i) => {
        let switchSectionButton = (section === 'preferment')
          ? <p className='cursor-pointer font-light text-gray-600 hover:text-black hover:italic'
              onClick={() => updateExtraInputPos('bulk', input)}>Move to Bulk</p>
          : <p className="cursor-pointer font-light text-gray-600 hover:text-black hover:italic"
              onClick={() => updateExtraInputPos('preferment', input)}>Move to Preferment</p>
        return (
          <div className='mt-2 mb-4' key={i}>
            <div className="w-full grid grid-cols-2">
              <input type="text" 
                placeholder='Olive Oil, Sugar, etc.'
                className="outline-0 w-11/12 mb-3 border-b-2 border-yellow-900 mr-2"
                onChange={update('extra', `extra${i}Name`, input)}
                value={extraInputFields[input.originalIndex]['extraName']}/>
              <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
                <input type="number" 
                  className="outline-0 w-20"
                  onChange={update('extra', `extra${i}Quantity`, input)}
                  value={extraInputFields[input.originalIndex]['extraQuantity']} />
                <p className="italic">grams</p>
              </div>
            </div>
            <div className='w-full grid grid-cols-2'>
              {switchSectionButton}
              <h3 onClick={() => removeExtraInputField(input.idx)}
                className="w-40 text-right cursor-pointer font-medium text-gray-800 hover:text-black hover:italic">Remove</h3>
            </div>
          </div>
      )}))
  }

  let pizzasString = (numPizzas > 1 || !numPizzas) ? 'pizzas' : 'pizza' 

  return(
    <div className='flex flex-wrap -mt-2 w-full mx-auto px-4'>
      {handleErrors()}
      <div className="flex mt-7 bg-white max-w-md px-4 mx-auto border-2 border-yellow-900 rounded-2xl ">
        <div className="flex flex-wrap justify-between py-4 " >
          <form className='w-full '
            onSubmit={handleSubmit} 
            id='recipe-form'>
            <input className="font-semibold text-2xl outline-0 w-full mb-3 border-b-2 border-yellow-900"
              type="text" 
              value={title} 
              onChange={update('title')} 
              placeholder="Title" />
            <br />
            <div className='mb-2'>
              <label className="inline-flex items-center whitespace-nowrap">Instant Yeast
                <input type="radio" 
                  // className="form-checkbox text-yellow-900 rounded-md ml-1 mr-2"
                  className="form-radio text-yellow-900 rounded-md ml-1 mr-2"
                  name="ferment-choice" 
                  defaultChecked 
                  onChange={() => updateFerment('yeast')}/>
              </label>
              <label className="inline-flex items-center whitespace-nowrap">Preferment
                <input type="radio" 
                  className="form-radio text-yellow-900 rounded-md ml-1 mr-2"
                  name="ferment-choice" 
                  onChange={() => updateFerment('preferment')}/>
              </label>
              <label className="inline-flex items-center whitespace-nowrap">Sourdough Starter
                <input type="radio"
                  className="form-radio text-yellow-900 rounded-md"
                  name="ferment-choice" 
                  onChange={() => updateFerment('sourdough')}/>
              </label>
            </div>
            {fermentedInputs()}
            <br />
            <div>
              <div className="w-full grid grid-cols-2">
                <input type="text" 
                  placeholder="Flour"
                  className="outline-0 w-11/12 mb-3 border-b-2 border-yellow-900 mr-2"
                  onChange={update('bulk', 'flourType')}/>
                <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
                  <input type="number" 
                    className="outline-0 w-20"
                    onChange={update('bulk', 'flourQuantity')} />
                  <p className="italic">grams</p>
                </div>
              </div>
              <div className="w-full grid grid-cols-2">
                <p className="inline-block w-20">Water</p>
                <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
                  <input type="number" 
                    className="outline-0 w-20 "
                    onChange={update('bulk', 'waterQuantity')} />
                  <p className="italic">grams</p>
                </div>
              </div>
              <div className="w-full grid grid-cols-2">
                <p className="inline-block w-20">Salt</p>
                <div className="flex w-40 justify-between mb-3 border-b-2 border-yellow-900">
                  <input type="number" 
                    className="outline-0 w-20 "
                    onChange={update('bulk', 'saltQuantity')} />
                  <p className="italic">grams</p>
                </div>
              </div>
            </div>
            <div className='mb-5 mt-2'>
              {mapRespectiveExtraItems('bulk')}
              <h3 onClick={addExtraInputField}
                className='cursor-pointer font-light text-gray-600 hover:text-black hover:italic'>Add an ingredient</h3>
            </div>
            <div className='flex flex-wrap items-center'>
              <h3 className="mr-2 whitespace-nowrap">This makes </h3>
              <input type="number" 
                onChange={updateNumPizzas()} 
                placeholder="3" 
                className="px-1 outline-0 w-10 mr-2 border-b-2 border-yellow-900" />
              <input type="text" id='size'
                onChange={updatePizzaSize()}
                placeholder="14&quot;, 10&quot;x14&quot;, etc. "
                className="outline-0 w-32 border-b-2 border-yellow-900 mr-2" />
              <h3 className="whitespace-nowrap mr-2">{` ${pizzasString} with `}</h3>
              <select className="form-select pl-0 pr-6" onChange={updateThickness()}>
                <option value="thin" >thin</option>
                <option value="thick" >thick</option>
              </select>
              <h3 className="-ml-1"> crust.</h3>
            </div>
          </form>
        </div>
      </div>
      <div className=" bg-white w-full max-w-md mx-auto mt-7 border-2 border-yellow-900 rounded-2xl">
        <div className="w-full h-full p-4 flex flex-col justify-between">
          <textarea form='recipe-form'
            type='text'
            value={body}
            onChange={update('body')}
            className='flex flex-col outline-0 w-full h-5/6 resize-none'
            placeholder="Share your method..." />
          {allowSubmit()}
        </div>
      </div>
    </div>
  )
}

export default withRouter(RecipeForm)
