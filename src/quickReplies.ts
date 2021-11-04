export interface repliesButtonType {
    messageText: string,
    action: string,
    label: string
};

export const quickReplies: Array<repliesButtonType> = [
    {
        messageText: '처음으로 돌아갈래!',
        action: 'message',
        label: '처음으로 돌아갈래!'
    },
    {
        messageText: '오늘 급식 메뉴는 뭐야?',
        action: 'message',
        label: '오늘 급식 메뉴는 뭐야?'
    },
    {
        messageText: '시간표 알려줘!',
        action: 'message',
        label: '시간표 알려줘!'
    }
];