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

    const ERROR_MESSAGE: string = 'π€¦π»ββοΈνκ΅μμ μ κ³΅νλ λ°μ΄ν° μ λ³΄κ° μμ΅λλ€. λμ€μ λ€μ μλν΄μ£ΌμΈμ.';

    this.application.post('/skill/meal', async (req: Request, res: Response, next: NextFunction) => {
      interface mealDataType {
        isError: boolean,
        code: string,
        message: string,
        length: number,
        mealData: Array<{ title: string, menu: Array<string> }>
      }

      const YMD = req.body['action']['detailParams']['user_select_date']['origin'];
      if (YMD) {
        try {
          const fetchMealMenu = await axios.get(`https://woongdo.kro.kr/api/meal?YMD=${YMD}`);
          const decodeData: mealDataType = fetchMealMenu.data;
          let returnValue: Array<{ title: string, description: string; }> = [];

          if (decodeData.isError) {
            throw new Error('μμ²­ μ€λ₯');
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
                    'items': [{ title: 'μ€λ₯!', description: ERROR_MESSAGE }]
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

      let { set_grade, set_class, set_date } = req.body['action']['params'];
      const numberRegex: RegExp = new RegExp('[0-9]')

      set_grade = set_grade.match(numberRegex)[0]
      set_class = set_class.match(numberRegex)[0]

      if (set_grade && set_class && set_date) {
        try {
          const fetchTimeTable = await axios.get(`https://woongdo.kro.kr/api/timetable?setGrade=${set_grade}&setClass=${set_class}&setDate=${encodeURI(set_date)}`);
          const decodeData: TimeTableDataType = fetchTimeTable.data;

          if (decodeData.isError) {
            throw new Error('μμ²­ μ€λ₯');
          }

          const str: string = decodeData.timeTable.reduce((pv: string, cv: string, idx: number) => {
            return (`${pv}\n${idx + 1}κ΅μ: ${cv}`)
          }, '');

          return res.json({
            'version': '2.0',
            'template': {
              'outputs': [
                {
                  'basicCard': {
                    'title': `[π${set_grade}νλ ${set_class}λ° ${set_date} μκ°νμλλ€.]`,
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
                    'title': `μ€λ₯!`,
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
