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
    this.application.use(express.urlencoded({ extended: false }));
  }

  private getPage() {

    const ERROR_MESSAGE: string = '🤦🏻‍♂️학교에서 제공하는 데이터 정보가 없습니다. 나중에 다시 시도해주세요.';

    this.application.post('/skill/meal', async (req: Request, res: Response, next: NextFunction) => {
      interface mealDataType {
        isError: boolean,
        code: string,
        message: string,
        length: number,
        mealData: Array<{ title: string, menu: Array<string> }>
      }

      const YMD = req.body.split('-').join('');
      if (YMD) {
        try {
          const fetchMealMenu = await axios.get(`https://woongdo.kro.kr/api/v2/meal?YMD=${YMD}`);
          const decodeData: mealDataType = fetchMealMenu.data;
          let returnValue: Array<{ title: string; description: string; }> = [];

          if (decodeData.isError) {
            throw new Error('요청 오류');
          }

          decodeData.mealData.forEach((meal) => {
            let description = '';
            meal.menu.forEach((element) => {
              description += ''.concat(element, '\n');
            });

            returnValue.push({ title: meal.title, description: description });
          });

          return res.json({
            'version': '2.0',
            'template': {
              'outputs': [
                {
                  'carousel': {
                    'type': 'basicCard',
                    'items': returnValue
                  }
                }
              ],
              'quickReplies': quickReplies
            }
          })
        } catch (err) {
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
          });
        }
      }
    });

    this.application.post('/skill/timetable', async (req: Request, res: Response, next: NextFunction) => {
      interface TimeTableDataType {
        isError: boolean,
        code: string,
        message: string,
        length: number,
        grade: string,
        class: string,
        timeTable: Array<string>
      }

      const { set_grade, set_class, set_date } = req.body;

      if (set_grade || set_class) {
        try {
          const fetchTimeTable = await axios.get(`https://woongdo.kro.kr/api/v2/timetable?setGrade=${set_grade}&setClass=${set_class}&setDate=${encodeURI(set_date)}`);
          const decodeData: TimeTableDataType = fetchTimeTable.data;

          if (decodeData.isError) {
            throw new Error('요청 오류');
          }

          let str: string = '';

          for (let i = 1; i <= decodeData.length; ++i)
            str += `${i}교시 : ${decodeData.timeTable[i - 1]}\n`;

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
        } catch (err) {
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
        }
      }
    });
  };
}

export default App;
