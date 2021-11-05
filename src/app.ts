import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import cors from 'cors';
import { quickReplies } from './quickReplies';

class App {
  public application: express.Application;

  constructor() {
    this.application = express();
    this.setMiddleWare();
    this.getPage();
  }

  private setMiddleWare() {
    this.application.use(cors());
    this.application.use(express.json());
  }

  private getPage() {

    const ERROR_MESSAGE: string = '🤦🏻‍♂️학교에서 제공하는 데이터 정보가 없습니다. 나중에 다시 시도해주세요.';

    this.application.post('/skill/meal', (req: Request, res: Response, next: NextFunction) => {
      const YMD = req.body['action']['detailParams']['user_select_date']['origin'].split('-').join('');
      if (YMD) {
        axios.get(`https://woongdo.kro.kr/api/v2/meal?YMD=${YMD}`)
          .then(response => {
            return res.json({
              'version': '2.0',
              'template': {
                'outputs': [
                  {
                    'carousel': {
                      'type': 'basicCard',
                      'items': response.data['mealData']
                    }
                  }
                ],
                'quickReplies': quickReplies
              }
            })
          })
          .catch(error => {
            return res.json({
              'version': '2.0',
              'template': {
                'outputs': [
                  {
                    'carousel': {
                      'type': 'basicCard',
                      'items': [{ title: '오류!', description: ERROR_MESSAGE }]
                    }
                  }
                ],
                'quickReplies': quickReplies
              }
            })
          });
      }
    });

    this.application.post('/skill/timetable', (req: Request, res: Response, next: NextFunction) => {
      const set_grade = req.body['action']['params']['set_grade'];
      const set_class = req.body['action']['params']['set_class'];
      const set_date = req.body['action']['params']['set_day'];

      if (set_grade || set_class) {
        axios.get(`https://woongdo.kro.kr/api/v2/timetable?grade=${set_grade}&class=${set_class}&date=${encodeURI(set_date)}`)
          .then(response => {
            let str: string = '';
            for (let i = 1; i <= response.data['length']; ++i)
              str += `${i}교시 : ${response.data['timeTable'][i - 1]}\n`;

            return res.json({
              'version': '2.0',
              'template': {
                'outputs': [
                  {
                    'basicCard': {
                      'title': `[📆${set_grade}학년 ${set_class}반 ${set_date} 시간표입니다.]`,
                      'description': str,
                      'thumbnail': {
                        'imageUrl': 'https://i.ibb.co/xs87HGY/v2-time-table.png'
                      }
                    }
                  }
                ],
                'quickReplies': quickReplies
              }
            })
          })
          .catch(error => {
            return res.json({
              'version': '2.0',
              'template': {
                'outputs': [
                  {
                    'basicCard': {
                      'title': `오류!`,
                      'description': ERROR_MESSAGE,
                      'thumbnail': {
                        'imageUrl': 'https://i.ibb.co/xs87HGY/v2-time-table.png'
                      }
                    }
                  }
                ],
                'quickReplies': quickReplies
              }
            })
          });
      }
    });
  };
}

export default App;
