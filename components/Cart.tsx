import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={20} className="text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">Karata</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Hakuna bidhaa kwenye karata</p>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.quantity} x TZS {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus size={16} className="text-gray-600" />
                  </button>
                  <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 font-semibold">Jumla:</span>
              <span className="text-2xl font-bold text-green-600">
                TZS {total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Kamilisha Malipo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
