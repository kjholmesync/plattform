import { CustomDescendant } from '../custom-types'

export const exampleTree: CustomDescendant[] = [
  {
    type: 'flyerTileOpening',
    id: '1',
    children: [
      {
        type: 'headline',
        children: [
          { text: 'Hallo,' },
          { type: 'break', children: [{ text: '' }] },
          { text: 'schoen sind Sie da!' },
        ],
      },
      {
        type: 'flyerOpeningP',
        children: [
          {
            text: 'Es war heiss, es ist heiss, es bleibt heiss. In Europa sind die Temperaturen grade hochsommerlich. Im Nahen Osten sind sie lebensfeindlich. ',
          },
          {
            type: 'link',
            children: [{ text: 'Im Irak wurden gestern 51.6°C gemessen.' }],
          },
          {
            text: ' Hoch genug, um in einem Backofen ein Entrecôte niederzugaren.',
          },
        ],
      },
    ],
  },
  {
    type: 'flyerTile',
    id: '2',
    children: [
      {
        type: 'flyerTopic',
        children: [{ text: 'Framing Heat' }],
      },
      {
        type: 'flyerTitle',
        children: [
          {
            text: 'Hitzewelle werden mit Strand- und Badebilder illustriert! Wieso?',
          },
        ],
      },
      {
        type: 'flyerAuthor',
        authorId: '123',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Und ja, sehr viele Medien weisen in diesem Kontext auch immer wieder auf die Klimaerwärmung hin. Das ist gut. Aber diese Bilder allein sind nicht mehr angemessen, weil sie die Situation verzerrt darstellen. Und wir wissen alle, Bilder haben oft eine grössere Wirkungskraft als das gesprochene Wort oder ein Text – insbesondere bei einem so abstrakten Thema wie der Klimakrise.',
          },
        ],
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'quizAnswer',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: "It's a yes!",
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'quizAnswerInfo',
              },
            ],
            type: 'quizItem',
            isCorrect: true,
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'quizAnswer',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Errrr, nope.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'quizAnswerInfo',
              },
            ],
            type: 'quizItem',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'Maybe',
                  },
                ],
                type: 'quizAnswer',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: "We are trying to wiggle out of it, aren't we?",
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'quizAnswerInfo',
              },
            ],
            type: 'quizItem',
          },
        ],
        type: 'quiz',
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Dr. Saffron O’Neill schlug 2019 in diesem Artikel einige gute Alternativen und Ergänzungen zu den Badebildern vor. Sie schrieb: «For many going about their daily lives during these heatwaves, life was not all fountain frolics and sunbathing.»',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Plantschfotos gehören immer noch dazu. Sie sind aber nicht die ganze Story – und vor allem sind sie nicht mehr die Titelgeschichte. Heute wurde der nationale Hitzerekord für den Juni egalisiert. Das ist nicht mehr nur eine Hitzewelle. Das ist die Klimakrise.',
          },
        ],
      },
      {
        type: 'figure',
        children: [
          {
            type: 'figureImage',
            images: {
              default: {
                url: '/static/flyer-pic.jpg',
              },
            },
            children: [{ text: '' }],
          },
        ],
      },
    ],
  },
  {
    type: 'flyerTile',
    id: '3',
    children: [
      {
        type: 'flyerMetaP',
        children: [
          {
            text: 'Nun stellen Sie sich vor, Sie müssten diese Hitze in Vollverschleierung erdulden. Wie so manche Krise trifft auch diese Frauen besonders hart. Geschlechterungleichheit und Klimawandel sind verflochten, ',
          },
          {
            type: 'link',
            children: [
              {
                text: 'schrieb die UNO im Februar in einem lesenswerten Report.',
              },
            ],
          },
          {
            text: 'In Afghanistan haben sich beinahe alle Hoffnungen zerschlagen, dass die Taliban nach ihrer Machtergreifung den Frauen zumindest einige hart erkämpfte Rechte und Freiheiten lassen würden.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Der Journalist Emran Feroz hat aufgeschrieben, wie sich das Land nach einem Jahr unter ihrer Herrschaft verändert hat. Seine Kurzzusammenfassung: “Die Taliban heissen korrupte Politiker der gefallenen Republik willkommen, während sie Ex-Soldaten jagen und Frauen den Krieg erklärt haben.”',
          },
        ],
      },
    ],
  },
  {
    type: 'flyerTile',
    id: '4',
    children: [
      {
        type: 'flyerMetaP',
        children: [
          {
            text: 'Ausserdem hören Sie heute in der Republik die letzte Sprachnotiz von Nicoletta Cimmino. ',
          },
          {
            type: 'link',
            children: [{ text: 'Sie handelt vom Abschied­nehmen.' }],
          },
          {
            text: ' Und weshalb man das manchmal früher als erhofft tun muss.',
          },
        ],
      },
      {
        type: 'flyerTopic',
        children: [{ text: 'Im Dialog' }],
      },
      {
        type: 'flyerAuthor',
        authorId: '456',
        children: [{ text: '' }],
      },
      {
        type: 'pullQuote',
        children: [
          {
            type: 'pullQuoteText',
            children: [{ text: 'Che tristezza, Nicoletta.' }],
          },
          {
            type: 'pullQuoteSource',
            children: [
              { text: 'Zum Beitrag: ' },
              { type: 'link', children: [{ text: 'Abschiednehmen' }] },
              { text: '.' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'flyerTile',
    id: '876',
    children: [
      {
        type: 'flyerTopic',
        children: [
          {
            text: 'Quizfrage',
          },
        ],
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Yes',
                  },
                ],
                type: 'quizAnswer',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: "It's a yes!",
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'quizAnswerInfo',
              },
            ],
            type: 'quizItem',
            isCorrect: true,
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'No',
                  },
                ],
                type: 'quizAnswer',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Errrr, nope.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'quizAnswerInfo',
              },
            ],
            type: 'quizItem',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'Maybe',
                  },
                ],
                type: 'quizAnswer',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: "We are trying to wiggle out of it, aren't we?",
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'quizAnswerInfo',
              },
            ],
            type: 'quizItem',
          },
        ],
        type: 'quiz',
      },
    ],
  },
  {
    type: 'flyerTileClosing',
    id: '5',
    children: [
      {
        type: 'headline',
        children: [{ text: 'Geniessen Sie die Hitze.' }],
      },
      {
        type: 'flyerSignature',
        children: [
          {
            text: 'Ihre Crew der Republik',
          },
        ],
      },
    ],
  },
]
