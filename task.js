const express =require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//  router.get('/task' ,async (req,res) => {
//     try{
//         const task = await Task.find({})
//         res.send('from TASK app',body)
//     }catch(e){
//         res.status(500).send()
//     }
//  })

//route handler for task
router.post('/task', auth, async(req,res) => {
   
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    
    } catch (e) {
        res.status(500).send(e)
    }
    
})

//endpoint for fetching  tasks 

router.get('/task',auth, async (req,res) => {
    try
    {
    const completed = req.query.completed
    let tasks
    if(completed){
    tasks = await Task.find({owner:req.user._id,completed})
    }
    else {
    tasks = await Task.find({owner:req.user._id})
    }
    return res.send(tasks)
    }
    catch(e){
        res.status(500).send(e)
    }
})

//endpoint for fetching specific tasks eg completed:true
router.get('/task', auth, async (req,res) => {
 
    
    const match = {}

    if(req.query.completed){
        match.completed= req.query.completed === 'true'
    }
    
    try {    
        await req.user.populate({
            path:'task',
            match,
            options:{
                //limit : 2              
                limit :parseInt(req.query.limit)
            }            
    }).execPopulate() 
    res.status(200).send(req.user.task)
       }
      
        catch (e) { 
        res.status(500).send(e)
    } 
    console.log("im here");
})

//endpoint for fetching a task by id
router.get('/task/:id',auth,async(req,res) => {
    const _id = req.params.id
    try{
        //const tasks = await task.findById(_id)
        const tasks = await Task.findOne({_id,owner : req.user._id})
        if(!tasks){
            return res.status(404).send()
        }
        res.status(200).send(tasks) 
    
    } catch (e) { 
        res.status(500).send(e)
    }    
})

router.patch('/task/:id',auth,async (req,res) => {
    const myupdates = Object.keys(req.body)
    const permissionToUppdate = ['description', 'completed']
    const isItValidOperation = myupdates.every((update) => permissionToUppdate.includes(update) )
    
    if(!isItValidOperation ){
        return res.status(400).send({error : 'Invalid update request'})
    }

    try{
        const taskss = await Task.findOne({ _id :req.params.id, owner: req.user._id})
             
        if(!taskss){
            return res.status(404).send()
        }       

        myupdates.forEach((update) => taskss[update] = req.body[update])
        await taskss.save()

        res.send(taskss)
    } catch(e){
        res.status(500).send(e)
    }
})

router.delete('/task/:id',auth,async (req,res) => {
    try{
        const deleteTask =await Task.findOneAndDelete({ _id :req.params.id, owner: req.user._id})
        if(!deleteTask){
            res.status(400).send('Task not found')
        }
        res.status(200).send(deleteTask)
    }catch(e){
        res.status(500).send()
            
    }
})

 module.exports = router