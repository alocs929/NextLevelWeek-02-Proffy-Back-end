import {Request, Response} from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController{
  async index(request: Request, response: Response){
    const {week_day, subject, time } = request.query;

    if( !week_day || !subject || !time){
      return response.status(400).json({
        error: 'Missing filters to search classes'
      });
    }

    const timeInMinutes = convertHourToMinutes(time as string);

    console.log(timeInMinutes);
    return response.status()
  }

  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
  
    const trx = await db.transaction();
  
    const insertedUsersIds = await trx('users').insert({
      name,
      avatar,
      whatsapp,
      bio
    });
  
    const user_id = insertedUsersIds[0];
  
    try{
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id
      });
    
      const class_id = insertedClassesIds[0];
    
      const classSchedule = schedule.map((scheduleItem: ScheduleItem)=>{
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to)
        };
      });
    
      await trx('class_schedule').insert(classSchedule);
      
      await trx.commit();
    
      return response.status(201).send();
    }catch(err){
      await trx.rollback();
      return response.status(400).json({
        erro:'Unexpected error while  creating new class'
      });
    }
  }

}