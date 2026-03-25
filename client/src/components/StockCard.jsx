import Card from './Card';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

function StockItem({ stock, theme }) {
  const isUp = stock.status === 'RISING';
  const isDown = stock.status === 'FALLING';
  const color = isUp ? 'text-red-500' : isDown ? 'text-blue-500' : theme.subtext;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const sign = isUp ? '+' : isDown ? '-' : '';
  const rate = stock.changeRate ? `${sign}${Math.abs(parseFloat(stock.changeRate))}%` : '';

  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${theme.badge}`}>
      <div className="flex items-center gap-2.5">
        {stock.logoUrl ? (
          <img src={stock.logoUrl} alt="" className="w-6 h-6 rounded-full" onError={(e) => e.target.style.display = 'none'} />
        ) : (
          <div className={`w-6 h-6 rounded-full ${theme.border} border flex items-center justify-center`}>
            <BarChart3 className="w-3 h-3" />
          </div>
        )}
        <div>
          <p className={`text-sm font-semibold ${theme.text} leading-tight`}>{stock.name}</p>
          <p className={`text-xs ${theme.subtext}`}>{stock.market === 'KR' ? 'KRX' : 'US'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${theme.text}`}>
          {stock.market === 'KR' ? `₩${stock.price}` : `$${stock.price}`}
        </p>
        <div className={`flex items-center gap-0.5 justify-end ${color}`}>
          <Icon className="w-3 h-3" />
          <span className="text-xs font-medium">{rate}</span>
        </div>
      </div>
    </div>
  );
}

export default function StockCard({ data, theme, delay = 0 }) {
  if (!data || data.length === 0) return null;

  const krStocks = data.filter(s => s.market === 'KR');
  const usStocks = data.filter(s => s.market === 'US');

  return (
    <Card theme={theme} delay={delay} className="col-span-full lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>📈 관심 종목</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {krStocks.map((stock, i) => (
          <StockItem key={`kr-${i}`} stock={stock} theme={theme} />
        ))}
        {usStocks.map((stock, i) => (
          <StockItem key={`us-${i}`} stock={stock} theme={theme} />
        ))}
      </div>
    </Card>
  );
}
