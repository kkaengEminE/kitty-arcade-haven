import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const games = [
    {
      id: 1,
      title: "🐱 플래피 캣",
      description: "점프해서 최대한 멀리 날아가세요!",
      path: "/flappy-cat",
      emoji: "🐱",
      color: "from-orange-400 to-pink-400"
    },
    {
      id: 2,
      title: "⚫⚪캣 오셀로",
      description: "검은 고양이 vs 흰 고양이 대결!",
      path: "/othello",
      emoji: "🐈",
      color: "from-gray-700 to-gray-300"
    },
    {
      id: 3,
      title: "🐹 햄스터 소코반",
      description: "해바라기씨를 구덩이에 넣으세요!",
      path: "/sokoban",
      emoji: "🐹",
      color: "from-amber-400 to-yellow-300"
    },
    {
      id: 4,
      title: "😺 스네이크 캣",
      description: "사료를 먹고 길어지세요!",
      path: "/snake-cat",
      emoji: "😺",
      color: "from-green-400 to-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-bounce-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary">
            🎮 냥냥 게임 아케이드
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            귀여운 고양이와 햄스터의 미니게임 천국!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {games.map((game, index) => (
            <Link key={game.id} to={game.path}>
              <Card 
                className={`p-8 hover:shadow-hover transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-border bg-card/80 backdrop-blur-sm animate-bounce-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center">
                  <div className={`text-7xl mb-4 inline-block animate-float`} 
                       style={{ animationDelay: `${index * 0.2}s` }}>
                    {game.emoji}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                    {game.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    {game.description}
                  </p>
                  <Button 
                    className={`w-full bg-gradient-to-r ${game.color} text-white border-0 font-bold text-lg py-6 hover:opacity-90 transition-opacity`}
                  >
                    게임 시작하기 🎯
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            💝 즐거운 게임 되세요!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
